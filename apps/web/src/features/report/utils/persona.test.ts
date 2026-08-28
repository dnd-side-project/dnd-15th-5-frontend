import { resolvePersonaVariant } from './persona';

describe('resolvePersonaVariant', () => {
  it.each([
    ['RHDP', 'local-regular'],
    ['RHDF', 'local-regular'],
    ['RWDP', 'local-regular'],
    ['RWDF', 'local-regular'],
    ['RHMP', 'night-watch'],
    ['RHMF', 'night-watch'],
    ['RWMP', 'night-watch'],
    ['RWMF', 'night-watch'],
    ['NHDP', 'alley-explorer'],
    ['NHDF', 'alley-explorer'],
    ['NWDP', 'alley-explorer'],
    ['NWDF', 'alley-explorer'],
    ['NHMP', 'food-nomad'],
    ['NHMF', 'food-nomad'],
    ['NWMP', 'food-nomad'],
    ['NWMF', 'food-nomad'],
  ])('%s 코드를 %s 카드로 분류한다', (type, expectedVariant) => {
    expect(resolvePersonaVariant(type)).toBe(expectedVariant);
  });

  it('유효하지 않은 코드는 카드 유형을 임의로 결정하지 않는다', () => {
    expect(resolvePersonaVariant('UNKNOWN')).toBeUndefined();
  });
});
