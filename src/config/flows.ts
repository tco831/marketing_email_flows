// src/config/flows.ts

interface EmailAction {
    type: 'sendEmail';
    email: {
        subject: string;
        body: string;
        to: string;
    };
}

interface TimerAction {
    type: 'timer';
    delay: string;
}

type Action = EmailAction | TimerAction;

interface Flow {
    id: string;
    trigger: { eventName: string };
    actions: Action[];
}

const flows: { flows: Flow[] } = {
    "flows": [
        {
            "id": "flow1",
            "trigger": {
                "eventName": "websiteSignup"
            },
            "actions": [
                {
                    "type": "timer",
                    "delay": "2h"
                },
                {
                    "type": "sendEmail",
                    "email": {
                        "subject": "Welcome to Sock World!",
                        "body": "Thank you for signing up to our website. We hope you love our socks!",
                        "to": "{{userEmail}}"
                    }
                }
            ]
        },
        {
            "id": "flow2",
            "trigger": {
                "eventName": "socksPurchased"
            },
            "actions": [
                {
                    "type": "sendEmail",
                    "email": {
                        "subject": "Payment Received",
                        "body": "Thank you for your purchase! We have received your payment.",
                        "to": "{{userEmail}}"
                    }
                },
                {
                    "type": "sendEmail",
                    "email": {
                        "subject": "Socks Dispatched",
                        "body": "Good news! Your socks have been dispatched and are on their way.",
                        "to": "{{userEmail}}"
                    }
                }
            ]
        }
    ]
};

export default flows;
