import { allVins } from './all_vins.testData';
import { salesforce } from './salesforce.testData';
import { vdms as _vdms } from './vdms.testData';

describe('produce set based results based on two arrays', () => {
  it('returns items unique to list 1', () => {
    const both = salesforce.filter((x) => allVins.includes(x));
    const sf_vins_not_in_vdms = salesforce.filter((x) => !allVins.includes(x));

    const sf_vins_in_vdms = salesforce.filter((x) => !sf_vins_not_in_vdms.includes(x));

    expect(both).toStrictEqual(sf_vins_in_vdms);

    // const diff2 = list1.filter((x) => !list2.includes(x));
    // // const unique = diff1.concat(diff2);

    // // eslint-disable-next-line no-console
    // diff1.forEach((i) => console.log(i));
    const output = sf_vins_in_vdms;
    // eslint-disable-next-line no-console
    console.log(output.join('\n') + '\n\nlength: ' + output.length);

    // expect(both).toStrictEqual(['B', 'C']);
    // expect(diff1).toStrictEqual(['A']);
    // expect(diff2).toStrictEqual(['D']);
    // expect(unique).toStrictEqual(['A', 'D']);
  });
});
