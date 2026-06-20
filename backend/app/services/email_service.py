import logging
from email.message import EmailMessage
import aiosmtplib
from app.core.config import settings
from jinja2 import Template
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

EMAIL_HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color:
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid
        h2 { color:
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid
        th { background-color:
        tr:hover { background-color:
        .amount { text-align: right; font-weight: bold; }
        .footer { margin-top: 30px; font-size: 12px; color:
    </style>
</head>
<body>
    <div class="container">
        <h2>Daily Top 10 Sales Report</h2>
        <p>Hello team,</p>
        <p>Please find below the summary of the top 10 days with the highest invoice totals.</p>
        
        <table>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Date</th>
                    <th style="text-align: right;">Total Sales Amount</th>
                </tr>
            </thead>
            <tbody>
                {% for row in data %}
                <tr>
                    <td>{{ loop.index }}</td>
                    <td>{{ row.date }}</td>
                    <td class="amount">${{ "{:,.2f}".format(row.total_sales) }}</td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
        
        <p class="footer">This is an automated system alert from Contalink Invoice System.</p>
    </div>
</body>
</html>
"""

async def send_top_sales_email(top_days: List[Dict[str, Any]]) -> bool:
    template = Template(EMAIL_HTML_TEMPLATE)
    html_content = template.render(data=top_days)

    msg = EmailMessage()
    msg["Subject"] = "Daily Top 10 Sales Report"
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = settings.EMAIL_TO
    msg.set_content(
        f"Daily Top 10 Sales Report:\n\n"
        + "\n".join([f"{i+1}. {row['date']}: ${row['total_sales']:,.2f}" for i, row in enumerate(top_days)])
    )
    msg.add_alternative(html_content, subtype="html")

    try:
        kwargs = {
            "hostname": settings.SMTP_HOST,
            "port": settings.SMTP_PORT,
            "use_tls": settings.SMTP_PORT == 465,
            "start_tls": settings.SMTP_PORT in (587, 25)
        }
        
        if settings.SMTP_USER:
            kwargs["username"] = settings.SMTP_USER
            kwargs["password"] = settings.SMTP_PASSWORD

        logger.info(f"Connecting to SMTP server at {settings.SMTP_HOST}:{settings.SMTP_PORT}...")
        async with aiosmtplib.SMTP(**kwargs) as smtp:
            await smtp.send_message(msg)
            logger.info("Daily email report sent successfully.")
            return True

    except Exception as e:
        logger.error(f"Failed to send email report: {e}")
        return False
