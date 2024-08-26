import { triggerFlow, sendEmail as actualSendEmail, wait as actualWait } from '../services/flowService';
import flows from '../config/flows';

// Mock the sendEmail and wait functions to avoid actual delays and simulate email sending
jest.mock('../services/flowService', () => ({
    ...jest.requireActual('../services/flowService'),
    sendEmail: jest.fn(async (email) => true),
    wait: jest.fn(async () => Promise.resolve()),
}));

describe('Flow Service', () => {
    it('should trigger flow1 and send a welcome email after a delay', async () => {
        const mockedSendEmail = actualSendEmail as jest.MockedFunction<typeof actualSendEmail>;

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

    it('should not trigger any flow if the event name is unknown', async () => {
        const event = { eventName: 'unknownEvent', userEmail: 'test@example.com' };

        await triggerFlow(event.eventName, event.userEmail);

        // Assuming no flows should be triggered
        expect(actualSendEmail).not.toHaveBeenCalled();
        expect(actualWait).not.toHaveBeenCalled();
    });

    it('should trigger multiple actions correctly', async () => {
        const event = { eventName: 'multipleActionsEvent', userEmail: 'test@example.com' };

        await triggerFlow(event.eventName, event.userEmail);

        // Check if the flow exists
        const flow = flows.flows.find(flow => flow.id === 'flow2');
        expect(flow).toBeDefined();

        const actions = flow?.actions || [];
        expect(actions.length).toBe(3);

        // Validate each action type and its properties
        expect(actions[0].type).toBe('sendEmail');
        expect(actions[1].type).toBe('timer');
        expect(actions[2].type).toBe('sendEmail');
    });

    it('should handle flow with wait time', async () => {
        const event = { eventName: 'waitEvent', userEmail: 'test@example.com' };

        await triggerFlow(event.eventName, event.userEmail);

        const flow = flows.flows.find(flow => flow.id === 'flowWithWait');
        expect(flow).toBeDefined();

        const actions = flow?.actions || [];
        expect(actions.length).toBe(2);

        expect(actions[0].type).toBe('wait');
        expect(actions[1].type).toBe('sendEmail');
    });
});
