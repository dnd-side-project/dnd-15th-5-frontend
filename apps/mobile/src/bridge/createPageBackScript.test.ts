import { createPageBackScript } from './createPageBackScript';

it('신뢰 origin만 화면 내부의 뒤로가기를 처리한다', () => {
  const event = jest.fn();
  const run = new Function('window', 'Event', createPageBackScript('https://chapchap.example.com'));
  run({ location: { origin: 'https://untrusted.example.com' }, dispatchEvent: event }, Event);
  expect(event).not.toHaveBeenCalled();
  run({ location: { origin: 'https://chapchap.example.com' }, dispatchEvent: event }, Event);
  expect(event.mock.calls[0]?.[0].type).toBe('chapchap:native-page-back');
});
