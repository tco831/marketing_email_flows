import { triggerFlow, sendEmail, wait } from '../services/flowService';
import flows from '../config/flows';

// Mock the sendEmail and wait functions to avoid actual delays and simulate email sending
jest.mock('../services/flowService', () => ({
    ...jest.requireActual('../services/flowService'),
    sendEmail: jest.fn(async (email) => true),
    wait: jest.fn(async () => Promise.resolve()),
}));

describe('Flow Service', () => {

    it('should trigger flow1 and send a welcome email after a delay', async () => {
        const event = { eventName: 'websiteSignup', userEmail: 'test@example.com' };

        await triggerFlow(event.eventName, event.userEmail);

        const flow = flows.flows.find(flow => flow.id === 'flow1');
        expect(flow).toBeDefined();

        const actions = flow?.actions || [];
        expect(actions.length).toBe(2);

        expect(actions[0].type).toBe('timer');
        expect(actions[0].delay).toBe('2h');
        expect(actions[1].type).toBe('sendEmail');
        expect(actions[1].email.subject).toBe('Welcome to Sock World!');
    });

    it('should trigger flow2 and send payment received and socks dispatched emails', async () => {
        const event = { eventName: 'socksPurchased', userEmail: 'test@example.com' };

        await triggerFlow(event.eventName, event.userEmail);

        const flow = flows.flows.find(flow => flow.id === 'flow2');
        expect(flow).toBeDefined();

        const actions = flow?.actions || [];
        expect(actions.length).toBe(2);

        expect(actions[0].type).toBe('sendEmail');
        expect(actions[0].email.subject).toBe('Payment Received');
        expect(actions[1].type).toBe('sendEmail');
        expect(actions[1].email.subject).toBe('Socks Dispatched');
    });

    it('should handle events with no matching flow', async () => {
        const event = { eventName: 'nonExistentEvent', userEmail: 'test@example.com' };

        const result = await triggerFlow(event.eventName, event.userEmail);

        expect(result).toBeUndefined(); // Adjust this based on how your service handles no matching flow
    });

    it('should handle email sending failure', async () => {
        (sendEmail as jest.Mock).mockResolvedValueOnce(false); // Simulate failure

        const event = { eventName: 'websiteSignup', userEmail: 'test@example.com' };

        await triggerFlow(event.eventName, event.userEmail);

        // Depending on how your service handles this, check for appropriate logs or behaviors
        // For example, ensure that an error was logged
        expect(sendEmail).toHaveBeenCalledTimes(1);
    });

    it('should handle different timer durations correctly', async () => {
        const event = { eventName: 'websiteSignup', userEmail: 'test@example.com' };

        const customFlow = {
            id: 'customFlow',
            trigger: { eventName: 'websiteSignup' },
            actions: [
                { type: 'timer', delay: '5m' },
                {
                    type: 'sendEmail',
                    email: { subject: 'Short Delay', body: 'Testing short delay', to: '{{userEmail}}' },
                },
            ],
        };

        flows.flows.push(customFlow); // Add a custom flow for testing

        await triggerFlow(event.eventName, event.userEmail);

        const flow = flows.flows.find(flow => flow.id === 'customFlow');
        expect(flow).toBeDefined();

        const actions = flow?.actions || [];
        expect(actions.length).toBe(2);

        expect(actions[0].type).toBe('timer');
        expect(actions[0].delay).toBe('5m');
        expect(actions[1].type).toBe('sendEmail');
        expect(actions[1].email.subject).toBe('Short Delay');
    });

    it('should handle large and complex flows', async () => {
        const complexFlow = {
            id: 'complexFlow',
            trigger: { eventName: 'complexEvent' },
            actions: [
                { type: 'timer', delay: '1h' },
                { type: 'sendEmail', email: { subject: 'First Email', body: '...', to: '{{userEmail}}' } },
                { type: 'timer', delay: '1h' },
                { type: 'sendEmail', email: { subject: 'Second Email', body: '...', to: '{{userEmail}}' } },
            ],
        };

        flows.flows.push(complexFlow); // Add the complex flow for testing

        const event = { eventName: 'complexEvent', userEmail: 'test@example.com' };
        await triggerFlow(event.eventName, event.userEmail);

        const flow = flows.flows.find(flow => flow.id === 'complexFlow');
        expect(flow).toBeDefined();

        const actions = flow?.actions || [];
        expect(actions.length).toBe(4);

        expect(actions[0].type).toBe('timer');
        expect(actions[0].delay).toBe('1h');
        expect(actions[1].type).toBe('sendEmail');
        expect(actions[1].email.subject).toBe('First Email');
        expect(actions[2].type).toBe('timer');
        expect(actions[2].delay).toBe('1h');
        expect(actions[3].type).toBe('sendEmail');
        expect(actions[3].email.subject).toBe('Second Email');
    });

});
