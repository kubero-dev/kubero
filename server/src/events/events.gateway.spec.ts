import { EventsGateway } from './events.gateway';
import { Server, Socket } from 'socket.io';

describe('EventsGateway', () => {
  let gateway: EventsGateway;
  let mockServer: Partial<Server>;
  let mockSocket: Partial<Socket>;

  beforeEach(() => {
    mockServer = {
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(),
    };
    gateway = new EventsGateway();
    // @ts-ignore
    gateway.server = mockServer as Server;

    mockSocket = {
      join: jest.fn(),
      leave: jest.fn(),
    };
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should join a room on handleJoin', () => {
    const data = { room: 'room1' };
    gateway.handleJoin(data, mockSocket as Socket);
    expect(mockSocket.join).toHaveBeenCalledWith('room1');
  });

  it('should leave a room on handleLeave', () => {
    const data = { room: 'room1' };
    gateway.handleLeave(data, mockSocket as Socket);
    expect(mockSocket.leave).toHaveBeenCalledWith('room1');
  });

  it('should emit event on sendEvent', () => {
    gateway.sendEvent('testEvent', { foo: 'bar' });
    expect(mockServer.emit).toHaveBeenCalledWith('testEvent', { foo: 'bar' });
  });

  it('should emit logline to room on sendLogline', () => {
    gateway.sendLogline('room1', 'logline');
    expect(mockServer.to).toHaveBeenCalledWith('room1');
    expect(mockServer.emit).toHaveBeenCalledWith('log', 'logline');
  });

  it('should emit terminal line to room on sendTerminalLine', () => {
    gateway.sendTerminalLine('room2', 'line');
    expect(mockServer.to).toHaveBeenCalledWith('room2');
    expect(mockServer.emit).toHaveBeenCalledWith('consoleresponse', 'line');
  });

  it('should write to execStreams on handleTerminal', () => {
    const writeMock = jest.fn();
    gateway.execStreams['roomX'] = {
      websocket: {} as any,
      stream: { write: writeMock },
    };
    gateway.handleTerminal(
      { room: 'roomX', data: 'input' },
      mockSocket as Socket,
    );
    expect(writeMock).toHaveBeenCalledWith('input');
  });

  it('should not throw if execStreams entry does not exist on handleTerminal', () => {
    expect(() =>
      gateway.handleTerminal(
        { room: 'notfound', data: 'input' },
        mockSocket as Socket,
      ),
    ).not.toThrow();
  });
});
