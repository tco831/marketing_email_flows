// src/services/flowService.ts
import flows from '../config/flows';

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
    trigger: {
        eventName: string;
    };
    actions: Action[];
}

interface FlowConfig {
    flows: Flow[];
}

// Cast the imported JavaScript module to a TypeScript interface
const flowConfig: FlowConfig = flows;

const sendEmail = async (email: { subject: string; body: string; to: string }): Promise<boolean> => {
    console.log(`Sending email to ${email.to}: ${email.subject}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const success = Math.random() < 0.95;
    if (!success) {
        console.log(`Failed to send email to ${email.to}`);
    }
    return success;
};

const wait = async (delay: string): Promise<void> => {
    console.log(`Waiting for ${delay}`);
    const delayInMilliseconds = parseInt(delay) * 60 * 60 * 1000;
    await new Promise((resolve) => setTimeout(resolve, delayInMilliseconds));
};

const executeActions = async (actions: Action[], context: { userEmail: string }): Promise<void> => {
    for (const action of actions) {
        if (action.type === 'sendEmail') {
            const email = { ...action.email, to: context.userEmail };
            await sendEmail(email);
        } else if (action.type === 'timer') {
            await wait(action.delay);
        }
    }
};

export const triggerFlow = async (eventName: string, userEmail: string): Promise<void> => {
    const flow = flowConfig.flows.find((flow) => flow.trigger.eventName === eventName);
    if (flow) {
        console.log(`Executing flow: ${flow.id}`);
        await executeActions(flow.actions, { userEmail });
    } else {
        console.log(`No flow found for event: ${eventName}`);
    }
};
