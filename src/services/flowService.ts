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

const flowConfig: FlowConfig = flows;

// Exporting sendEmail so it can be mocked in tests
export const sendEmail = async (email: { subject: string; body: string; to: string }): Promise<boolean> => {
    console.log(`Sending email to ${email.to}: ${email.subject}`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const success = Math.random() < 0.95;
    if (!success) {
        console.log(`Failed to send email to ${email.to}`);
    }
    return success;
};

// Exporting wait so it can be mocked in tests
export const wait = async (delay: string): Promise<void> => {
    console.log(`Waiting for ${delay}`);
    // For testing, convert the delay to seconds instead of hours
    const delayInMilliseconds = parseInt(delay) * 1000;  // 1 second instead of 1 hour
    await new Promise(resolve => setTimeout(resolve, delayInMilliseconds));
};

const executeActions = async (actions: Action[], context: { userEmail: string }): Promise<void> => {
    for (const action of actions) {
        if (action.type === 'sendEmail') {
            const email = { ...action.email, to: context.userEmail };
            console.log(`Executing sendEmail action with details: ${JSON.stringify(email, null, 2)}`);
            const success = await sendEmail(email);
            if (!success) {
                console.error('Failed to send email:', email);
            }
        } else if (action.type === 'timer') {
            console.log(`Executing timer action with delay: ${action.delay}`);
            await wait(action.delay);
        }
    }
};

// Exporting triggerFlow as the main function to handle flow execution
export const triggerFlow = async (eventName: string, userEmail: string): Promise<void> => {
    const flow = flowConfig.flows.find(flow => flow.trigger.eventName === eventName);
    if (flow) {
        console.log(`Executing flow: ${flow.id} for event: ${eventName}`);
        console.log(`Flow actions: ${JSON.stringify(flow.actions, null, 2)}`);
        await executeActions(flow.actions, { userEmail });
    } else {
        console.log(`No flow found for event: ${eventName}`);
    }
};
