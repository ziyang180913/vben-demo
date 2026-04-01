export interface Poi {
  name: string;
  circle_attribute_from?: string;
  month_uv?: number;
  work_uv?: number;
  week_uv?: number;
  circle_id?: string;
  area?: string;
  hotel_cnt?: number;
  room_cnt?: number;
  month_live_cnt?: number;
  weekday_live_avg?: number;
  weekend_live_avg?: number;
  [key: string]: any;
}

export interface GetTipDomProps {
  poi: Poi;
  checked: boolean;
  callback: (value: boolean, poi: Poi) => void;
  closeRightCard: () => void;
}

interface Tag {
  label: string;
  value: string;
}

const TipDom = {
  getGatherTipDom: (poi: Poi, closeRightCard: () => void): HTMLElement => {
    const dom = document.createElement('div');

    const tag: Tag[] = [
      { label: '月均居住', value: 'month_live_cnt' },
      { label: '工作日均', value: 'weekday_live_avg' },
      { label: '周末日均', value: 'weekend_live_avg' },
    ];

    dom.innerHTML = `
      <div class="marker-box">
        <div style="
          background: #fff;
          border: 1px solid #fff;
          width: 320px;
          font-size: 12px;
          color: #fff;
          position: absolute;
          left: 50%;
          bottom: -54px;
          margin: 0 auto;
          padding: 20px 12px 12px;
          transform: translate(-50%, -50%);
          display: inline-table;
          white-space: nowrap;
          border-radius: 4px;
          box-shadow: 0px 12px 48px 16px rgba(0,0,0,0.03), 0px 9px 28px 0px rgba(0,0,0,0.05), 0px 6px 16px -8px rgba(0,0,0,0.08);
          position: relative;
        ">
          <span style="
            position: absolute;
            right: 10px;
            top: 6px;
            z-index: 10;
            color: rgba(2, 4, 13, 0.45);
            cursor: pointer;
            font-size: 12px;
          " class="close-btn">✕</span>
          <div style="
            font-weight: 500;
            font-size: 16px;
            color: rgba(0,11,54,0.85);
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">
            <div style="display: flex; align-items: center;">
              ${poi.name}
              <span style="
                margin-left: 8px;
                height: 20px;
                background: rgba(52,85,255,0.08);
                padding: 0 4px;
                border-radius: 2px;
                font-weight: 400;
                font-size: 12px;
                color: #3455FF;
              ">${poi.circle_id || ''}</span>
            </div>
          </div>
          <div style="margin: 8px 0;">
            ${
              poi.area
                ? `
              <span style="
                height: 20px;
                padding: 2px 4px;
                border-radius: 2px;
                font-weight: 400;
                font-size: 12px;
                color: rgba(0,11,54,0.65);
                border: 1px solid rgba(0,11,54,0.08);
              ">面积${poi.area || '-'}</span>
            `
                : ''
            }
            ${
              poi.hotel_cnt
                ? `
              <span style="
                margin-left: 4px;
                height: 20px;
                padding: 2px 4px;
                border-radius: 2px;
                font-weight: 400;
                font-size: 12px;
                color: rgba(0,11,54,0.65);
                border: 1px solid rgba(0,11,54,0.08);
              ">${poi.hotel_cnt || '-'}家酒店</span>
            `
                : ''
            }
            ${
              poi.room_cnt
                ? `
              <span style="
                margin-left: 4px;
                height: 20px;
                padding: 2px 4px;
                border-radius: 2px;
                font-weight: 400;
                font-size: 12px;
                color: rgba(0,11,54,0.65);
                border: 1px solid rgba(0,11,54,0.08);
              ">共计${poi.room_cnt || '-'}个房间</span>
            `
                : ''
            }
          </div>
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: rgba(0,11,54,0.65);
            font-weight: 400;
            font-size: 12px;
            background: #F8F8F8;
            border-radius: 4px;
            padding: 10px;
            margin-top: 8px;
          ">
            ${tag
              .map(
                (item, i) => `
              <div style="
                width: 33%;
                text-align: center;
                position: relative;
              ">
                ${
                  i
                    ? `<div style="
                  height: 32px;
                  width: 1px;
                  background: #EDEDED;
                  position: absolute;
                  left: 0;
                  top: 0;
                  bottom: 0;
                  margin: auto;
                "></div>`
                    : ''
                }
                <div>${item.label}</div>
                <div style="margin-top: 4px;">
                  <span style="font-weight: 500; font-size: 16px;">
                    ${poi[item.value] ? parseInt(String(poi[item.value])) : '-'}
                  </span>
                  人
                </div>
              </div>
            `,
              )
              .join('')}
          </div>
          <div style="
            position: absolute;
            bottom: -18px;
            left: 0;
            right: 0;
            margin: auto;
            border: 10px solid transparent;
            border-top-color: #fff;
            width: 0;
            height: 0;
          "></div>
        </div>
      </div>
    `;

    const closeBtn = dom.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeRightCard);
    }

    return dom;
  },

  getTipDom: ({ poi, closeRightCard }: GetTipDomProps): HTMLElement => {
    const dom = document.createElement('div');

    dom.innerHTML = `
      <div class="marker-box">
        <div style="
          background: #fff;
          border: 1px solid #fff;
          font-size: 12px;
          color: #fff;
          position: absolute;
          left: 50%;
          bottom: -20px;
          margin: 0 auto;
          padding: 4px 8px;
          transform: translate(-50%, -50%);
          display: inline-table;
          white-space: nowrap;
          border-radius: 4px;
          box-shadow: 0px 12px 48px 16px rgba(0,0,0,0.03), 0px 9px 28px 0px rgba(0,0,0,0.05), 0px 6px 16px -8px rgba(0,0,0,0.08);
          position: relative;
          cursor: pointer;
        ">
          <div style="
            font-weight: 500;
            font-size: 12px;
            color: rgba(0,11,54,0.85);
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">
            <div style="display: flex; align-items: center;">
              ${poi.name}
            </div>
          </div>
          <div style="
            position: absolute;
            bottom: -18px;
            left: 0;
            right: 0;
            margin: auto;
            border: 10px solid transparent;
            border-top-color: #fff;
            width: 0;
            height: 0;
          "></div>
        </div>
      </div>
    `;

    dom.addEventListener('click', closeRightCard);

    return dom;
  },
};

export default TipDom;
