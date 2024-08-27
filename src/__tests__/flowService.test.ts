import * as flowService from '../services/flowService';
import { triggerFlow } from '../services/flowService';

describe('Flow Service', () => {
    let mockedSendEmail: jest.SpyInstance;
    let mockedWait: jest.SpyInstance;

    beforeEach(() => {
        // Mock the sendEmail and wait functions for each test case
        mockedSendEmail = jest.spyOn(flowService, 'sendEmail').mockImplementation(jest.fn());
        mockedWait = jest.spyOn(flowService, 'wait').mockImplementation(jest.fn());

        // Clear mock calls between tests
        jest.clearAllMocks();
    });

    afterEach(() => {
        // Restore the original implementations after each test
        jest.restoreAllMocks();
    });

    it('should trigger flow1 and execute actions correctly for websiteSignup event', async () => {
        const event = { eventName: 'websiteSignup', userEmail: 'test@example.com' };

        await triggerFlow(event.eventName, event.userEmail);

        // Validate that the wait function was called correctly
        expect(mockedWait).toHaveBeenCalledTimes(1);
        expect(mockedWait).toHaveBeenCalledWith('2h');

        // Validate that the sendEmail function was called correctly
        expect(mockedSendEmail).toHaveBeenCalledTimes(1);
        expect(mockedSendEmail).toHaveBeenCalledWith({
            subject: 'Welcome to Sock World!',
            body: 'Thank you for signing up to our website. We hope you love our socks!',
            to: 'test@example.com',
        });
    });

    it('should trigger flow2 and execute actions correctly for socksPurchased event', async () => {
        const event = { eventName: 'socksPurchased', userEmail: 'buyer@example.com' };

        await triggerFlow(event.eventName, event.userEmail);

        // Validate that sendEmail was called twice with correct details
        expect(mockedSendEmail).toHaveBeenCalledTimes(2);
        expect(mockedSendEmail).toHaveBeenNthCalledWith(1, {
            subject: 'Payment Received',
            body: 'Thank you for your purchase! We have received your payment.',
            to: 'buyer@example.com',
        });
        expect(mockedSendEmail).toHaveBeenNthCalledWith(2, {
            subject: 'Socks Dispatched',
            body: 'Good news! Your socks have been dispatched and are on their way.',
            to: 'buyer@example.com',
        });
    });

    it('should not trigger any flow for an unknown event', async () => {
        const event = { eventName: 'unknownEvent', userEmail: 'unknown@example.com' };

        await triggerFlow(event.eventName, event.userEmail);

        // Validate that neither wait nor sendEmail were called
        expect(mockedWait).not.toHaveBeenCalled();
        expect(mockedSendEmail).not.toHaveBeenCalled();
    });
});
