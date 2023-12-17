// @ts-check

import { regions } from "./regions.js";
import { colors } from './colors.js';
import { setActiveRegion } from './map/index.js';
import { setInfo } from './info.js';

export function drawLegendItems() {
  const legendItems = document.getElementById('legend');

  regions.forEach((region, index) => {
    const { name } = region;
    const item = document.createElement('div');
    item.className = 'item';
    item.dataset.region = name.en;

    item.innerHTML = (`
      <div class="color" style="background: ${colors[index].color}"></div>
      <div class="pattern" style="border-color: ${colors[index].color}">
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect fill="${colors[index].pattern}" />
        </svg>
      </div>
      <div class="name">
        <ruby class="furigana">
          <div class="ja">
            <rtc>${name.furigana.map(char => `<rt>${char}</rt>`).join('')}</rtc>
            <rbc>${name.ja.map(char => `<rb>${char}</rb>`).join('')}</rbc>
          </div>
          <rtc class="annotation"><rt>${name.en}</rt></rtc>
        </ruby>
      </div>
    `);

    item.onclick = () => setActiveRegion(region);

    legendItems?.appendChild(item);
  });

  const legendH1 = document.querySelector('#title h1');
  legendH1?.addEventListener('click', () => {
    setActiveRegion();
    setInfo();
  });
}
