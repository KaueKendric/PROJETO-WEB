import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv
from jinja2 import Environment, FileSystemLoader
from fastapi import BackgroundTasks

# Carrega variáveis de ambiente
load_dotenv()

EMAIL_ADDRESS = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASS")

# Configura ambiente do Jinja2 (templates HTML)
template_env = Environment(loader=FileSystemLoader("app/utils/templates"))

def render_template(template_name: str, context: dict) -> str:
    """
    Renderiza um template HTML usando Jinja2.
    """
    template = template_env.get_template(template_name)
    return template.render(context)


def enviar_email_background(
    background_tasks: BackgroundTasks,
    destinatario: str,
    assunto: str,
    template_name: str,
    context: dict
):
    """
    Enfileira tarefa para envio de e-mail com template HTML via BackgroundTasks.
    """
    html_content = render_template(template_name, context)
    print("🔎 Conteúdo HTML renderizado:")
    print(html_content)
    background_tasks.add_task(enviar_email, destinatario, assunto, html_content)
    

def enviar_email(destinatario: str, assunto: str, html_content: str):
    """
    Envia o e-mail usando smtplib com conteúdo HTML.
    """
    msg = EmailMessage()
    msg["Subject"] = assunto
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = destinatario
    msg.set_content("Seu cliente de e-mail não suporta HTML.")
    msg.add_alternative(html_content, subtype="html")

    try:
        print(f"Tentando enviar e-mail para: {destinatario}")
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            smtp.send_message(msg)
        print(f"E-mail enviado com sucesso para: {destinatario}")
    except Exception as e:
        print("❌ Erro ao enviar e-mail:", str(e))
