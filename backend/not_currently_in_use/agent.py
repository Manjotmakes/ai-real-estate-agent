# agent.py

from email_utils import send_email

def notify_property_owner(property_data):
    subject = f"Inquiry about property at {property_data['address']}"
    body = (
        f"Hello,\n\n"
        f"I'm interested in the property located at {property_data['address']}.\n"
        f"Could you please confirm the current availability and asking rent?\n\n"
        f"Thanks,\nAI Agent"
    )
    send_email(property_data["contact_email"], subject, body)


if __name__ == "__main__":
    sample = {
        "address": "3901 Capitol St, Houston, TX",
        "contact_email": "raviking2311@gmail.com"
    }
    notify_property_owner(sample)
