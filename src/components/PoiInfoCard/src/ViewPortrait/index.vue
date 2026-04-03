<template>
  <div class="view-portrait-modal-content">
    <div>
      <RadioGroup
        v-model:value="radioValue"
        class="view-portrait-radio-group"
        :options="filterLabel"
        option-type="button"
        style="margin-right: 8px"
        @change="handleRadioChange"
      />
    </div>
    <div style="display: flex; position: relative; justify-content: space-between; margin: 20px 0">
      <div>
        <DatePicker
          v-model:value="curMonth"
          picker="month"
          :disabled-date="disabledDate"
          style="width: 200px"
        />
        <!-- 品牌偏好才展示业态选择 -->
        <template v-if="!isSeven">
          <Select
            v-model:value="curSelect"
            style="min-width: 200px; margin-left: 20px"
            placeholder="请选择业态"
            :max-tag-count="1"
            mode="multiple"
            :options="categoryList"
          />
          <div style="display: inline-block; margin-top: 5px; color: red">
            提示：非会员只能查询最近2个月的业态偏好数据，更早数据请联系客户经理。
          </div>
        </template>
      </div>
      <Button type="primary" @click="onExport">导出</Button>
    </div>

    <Spin :spinning="loading">
      <CustomerBase v-if="radioValue === 1" :data="portraitData[1]" :params="params || {}" />
      <IncomeConsumptionOccupation v-else-if="radioValue === 2" :data="portraitData[2]" />
      <BusinessLabel v-else-if="radioValue === 3" :data="portraitData[3]" />
      <VehicleRelated v-else-if="radioValue === 4" :data="portraitData[4]" />
      <RestaurantLabel v-else-if="radioValue === 5" :data="portraitData[5]" />
      <ShoppingPreferences
        v-else-if="radioValue === 6"
        :data="portraitData[6]"
        title="商场偏好"
        :info="info"
      />
      <Table
        v-else-if="radioValue === 7"
        :columns="columns"
        :data-source="brandDataSource"
        :pagination="false"
      />
      <MobileTerminal v-else-if="radioValue === 8" :data="portraitData[8]" />
      <BusinessLabelBold
        v-else-if="radioValue === 9"
        :data="portraitData[9] || {}"
        :tabs-config="tabsConfig1"
        :columns="businessColumns"
        :get-data="getPortrait"
        :set-store="(params: any) => (store[9] = params)"
      />
      <Operator v-else-if="radioValue === 11" :data="portraitData[11]" />
    </Spin>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, h } from 'vue';
  import { Button, DatePicker, RadioGroup, Select, Spin, Table } from 'ant-design-vue';
  import type { TableColumnType } from 'ant-design-vue';
  import dayjs, { type Dayjs } from 'dayjs';
  import { getBasePersona } from '@/api/new-mall/insight';
  import { TipsExplain } from '@/components/TipsExplain';
  import BusinessLabel from '../BusinessLabel/index.vue';
  import BusinessLabelBold from '../BusinessLabelBold/index.vue';
  import CustomerBase from '../CustomerBase/index.vue';
  import IncomeConsumptionOccupation from '../IncomeConsumptionOccupation/index.vue';
  import MobileTerminal from '../MobileTerminal/index.vue';
  import Operator from '../Operator/index.vue';
  import RestaurantLabel from '../RestaurantLabel/index.vue';
  import ShoppingPreferences from '../ShoppingPreferences/index.vue';
  import VehicleRelated from '../VehicleRelated/index.vue';

  const content = `<div class="tips-explain font-16-left-400-pr65 shows">
  <div class="tips-explain-item font-14-left-400-pr85">
  所选客群到访各品牌的比例情况， 到访人数/所选客群总人数
  </div>
  <div>`;

  const tabsConfig1 = [
    { label: '一级业态', key: 'default' },
    { label: '餐饮', key: '餐饮' },
    { label: '零售', key: '零售' },
    { label: '生活配套', key: '生活配套' },
    { label: '休闲娱乐', key: '休闲娱乐' },
    { label: '家庭亲子', key: '家庭亲子' },
  ];

  const businessColumns: TableColumnType<any>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: '10%',
      customRender: ({ index }) => index + 1,
    },
    {
      title: '业态',
      dataIndex: 'category',
      key: 'category',
      width: '60%',
    },
    {
      title: '比例',
      dataIndex: 'ratio',
      key: 'ratio',
      width: '30%',
      customRender: ({ text }) => `${Number((text * 100).toFixed(2))}%`,
    },
  ];

  const columns: TableColumnType<any>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      customRender: ({ index }) => index + 1,
    },
    {
      title: '二级业态',
      dataIndex: 'second_category_name',
      key: 'second_category_name',
    },
    {
      title: '品牌',
      dataIndex: 'label_name',
      key: 'label_name',
    },
    {
      title: () =>
        h('div', { style: { display: 'flex' } }, [
          '比例',
          h(TipsExplain, { style: { marginLeft: '10px' }, content }),
        ]),
      dataIndex: 'label_value',
      key: 'label_value',
      customRender: ({ text }) => `${Number((text * 100).toFixed(2))}%`,
    },
  ];

  interface FilterLabelItem {
    label: string;
    value: number;
    permissionId?: string;
  }

  interface Props {
    params?: Record<string, any>;
    curLable?: FilterLabelItem;
    filterLabel: FilterLabelItem[];
    info?: Record<string, any>;
  }

  const props = defineProps<Props>();

  const monthFormat = 'YYYY-MM';
  const curMonth = ref<Dayjs>(dayjs().subtract(2, 'month'));
  const radioValue = ref<number>(0);
  const portraitData = ref<Record<number, any>>({});
  const curSelect = ref<string[]>([]);
  const loading = ref(false);
  const store = ref<Record<number, any>>({});

  const isSeven = computed(() => radioValue.value !== 7);

  const brandDataSource = computed(() => {
    const list = portraitData.value?.[7]?.['品牌偏好'] || [];
    return list.map((item: any, idx: number) => ({ index: idx + 1, ...item }));
  });

  const handleRadioChange = (e: any) => {
    radioValue.value = e.target.value;
  };

  const getRequestParams = (extParams: Record<string, any> = {}) => {
    const params = curSelect.value.length ? { business: curSelect.value } : {};
    let param: Record<string, any> = {
      ...props.params,
      analysis_type: radioValue.value,
      month: dayjs(curMonth.value).format(monthFormat),
      ...params,
    };
    const stored = store.value[radioValue.value];
    if (stored && isObject(stored)) {
      param = { ...param, ...stored };
    }
    if (extParams && Object.keys(extParams).length) {
      param = { ...param, ...extParams };
    }
    return param;
  };

  const getData = async (extParams: Record<string, any> = {}) => {
    const res = await getBasePersona(getRequestParams(extParams));
    if (res?.code !== 200) return null;
    return res?.data?.data;
  };

  const getAllBusinessBoldData = async () => {
    const _data = portraitData.value[9] || {};
    const requestKey: string[] = [];
    tabsConfig1.forEach((item) => {
      if (!_data[item.key]) {
        requestKey.push(item.key);
      }
    });

    if (!requestKey.length) return _data;

    const promises = requestKey.map((item) =>
      getData(item !== 'default' ? { category: item } : {}),
    );
    const res = await Promise.all(promises);
    requestKey.forEach((key) => {
      _data[key] = res.shift() || [];
    });
    portraitData.value = { ...portraitData.value, 9: { ..._data } };
    return _data;
  };

  const getPortrait = async (extParams: Record<string, any> = {}) => {
    loading.value = true;
    const data = await getData(extParams);
    if (!data) {
      loading.value = false;
      (window as any).Utils?.toast?.('查询失败！');
      return;
    }

    const responseData: Record<number, any> = {
      [radioValue.value]: Array.isArray(data) ? data : { ...data },
    };

    if (radioValue.value === 9) {
      const _extParams = store.value[radioValue.value] || {};
      responseData[radioValue.value] = {
        ...(portraitData.value[radioValue.value] || {}),
        [_extParams?.category || 'default']: data,
      };
    }

    portraitData.value = {
      ...portraitData.value,
      ...responseData,
    };
    loading.value = false;
  };

  const disabledDate = (current: Dayjs) =>
    (current && current > dayjs().endOf('month')) || (current && current < dayjs('2023-07'));

  const categoryList = [
    { label: '美食', value: '美食' },
    { label: '购物', value: '购物' },
    { label: '休闲娱乐', value: '休闲娱乐' },
    { label: '亲子', value: '亲子' },
    { label: '全部', value: '全部' },
  ];

  const isObject = (value: any) =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

  const onExport = async () => {
    const exportData: { name: string; data: any[] }[] = [];
    let _res: Record<string, any>;
    const pd = portraitData.value;

    switch (radioValue.value) {
      case 1:
        const listData: any[] = [];
        Object.keys(pd[1] || {}).forEach((item1) => {
          const curData = pd[1]?.[item1] || {};
          const cols = Object.keys(curData);
          const data = Object.values(curData);
          listData.push([[item1], cols, data]);
        });
        exportData.push({
          name: '基础画像',
          data: listData.flat(),
        });
        break;
      case 2:
        Object.keys(pd[2] || {}).forEach((item1) => {
          const curData = pd[2]?.[item1] || {};
          const cols = Object.keys(curData).sort((a, b) => {
            const sortA = Number(a.split('K')[0]);
            const sortB = Number(b.split('K')[0]);
            return sortA - sortB;
          });
          const data = cols.map((item) =>
            typeof curData[item] === 'number'
              ? curData?.[item] || '-'
              : curData?.[item]?.['比例'] || 0,
          );
          exportData.push({
            name: item1,
            data: [cols, data],
          });
        });
        break;
      case 3:
        Object.keys(pd[3] || {}).forEach((item1) => {
          const curData = pd[3]?.[item1] || {};
          const cols = Object.keys(curData);
          const data: any[] = Object.values(curData);
          const number = Object.keys(data[0]).map((item) => [item, data[0][item]]);
          const bl = Object.keys(data[1]).map((item) => [item, data[1][item]]);
          exportData.push({
            name: item1,
            data: [[cols[0]], ...number, [cols[1]], ...bl],
          });
        });
        break;
      case 4:
        Object.keys(pd[4] || {}).forEach((item1) => {
          const curData = pd[4]?.[item1] || {};
          const cols = Object.keys(curData);
          const data = Object.values(curData);
          exportData.push({
            name: item1,
            data: [cols, data],
          });
        });
        break;
      case 5:
        Object.keys(pd[5] || {}).forEach((item1) => {
          const curData = pd[5]?.[item1] || {};
          const cols = Object.keys(curData);
          const data: any[] = Object.values(curData);
          if (data.length) {
            const number1 = Object.keys(data[0]).map((item) => [item, data[0][item]]);
            const number2 = Object.keys(data[1]).map((item) => [item, data[1][item]]);
            const exeData: any[] = [[cols[0]], ...number1, [cols[1]], ...number2];
            if (cols[2]) {
              const number3 = Object.keys(data[2]).map((item) => [item, data[2][item]]);
              exeData.push([cols[2]], ...number3);
            }
            exportData.push({
              name: item1,
              data: exeData,
            });
          }
        });
        break;
      case 6:
        const scListTable = [
          'poiId',
          '商场名称',
          '经度',
          '纬度',
          '围栏',
          '到访人数',
          '到访竞品人数比例',
        ];
        const list = (pd[6] || []).map((item: any) => {
          const location = item.p_loc ? item.p_loc.split(',') : [0, 0];
          return [
            item.competitor_p_id,
            item.p_name,
            location[0],
            location[1],
            item.pb_boundary,
            item.pv,
            item.ratio,
          ];
        });
        exportData.push({
          name: '商场偏好',
          data: [scListTable, ...list],
        });
        break;
      case 7:
        const dataSource = (pd?.[7]?.['品牌偏好'] || []).map((item: any) => [
          item.second_category_name,
          item.label_name,
          item.label_value,
        ]);
        exportData.push({
          name: '品牌偏好',
          data: [['二级业态', '品牌', '比例'], ...dataSource],
        });
        break;
      case 8:
        Object.keys(pd[8] || {}).forEach((item1) => {
          const curData = pd[8]?.[item1] || {};
          const strKey1 = '比例';
          const strKey2 = '人数';
          const _isNum = (v: any) => typeof v === 'number';
          const bl = Object.keys(curData).map((item) => [
            item,
            _isNum(curData[item]) ? curData[item] : curData[item][strKey1],
          ]);
          const rs = Object.keys(curData).map((item) => [
            item,
            _isNum(curData[item]) ? curData[item] : curData[item][strKey2],
          ]);
          exportData.push({
            name: item1,
            data: [[strKey1], ...bl, [strKey2], ...rs],
          });
        });
        break;
      case 9:
        _res = await getAllBusinessBoldData();
        Object.keys(_res).forEach((item1) => {
          const curData = _res[item1] || [];
          const _columns = [...businessColumns.map((item) => item.title), '人次'];
          const _data: any[] = [];
          curData.forEach((item: any, index: number) => {
            const _itemData: any[] = [];
            businessColumns.forEach((_col: any) => {
              if (_col.customRender) {
                _itemData.push(
                  _col.customRender({ text: item[_col.dataIndex!], record: item, index }),
                );
              } else {
                _itemData.push(item[_col.dataIndex!]);
              }
            });
            _data.push([..._itemData, item.pv]);
          });
          exportData.push({
            name: item1 === 'default' ? '一级业态' : item1,
            data: [_columns, ..._data],
          });
        });
        break;
      case 11:
        Object.keys(pd[11] || {}).forEach((item1) => {
          const curData = pd[11]?.[item1] || {};
          const _columns = ['名称', '占比'];
          const data: any[] = [];
          Object.keys(curData).forEach((item) => {
            data.push([item, `${Number((curData[item] * 100).toFixed(2))}%`]);
          });
          exportData.push({
            name: item1,
            data: [_columns, ...data],
          });
        });
        break;
      default:
    }

    const month = dayjs(curMonth.value).format(monthFormat);
    let exeTltie = '无';
    try {
      const curTab = props.filterLabel.filter((v) => v.value === radioValue.value);
      if (curTab.length) {
        exeTltie = String(curTab[0].label);
      }
    } catch (error) {
      console.log(error);
    }
    const excelName = `${exeTltie}-${month}.xlsx`;
    (window as any).Utils?.excel?.createFile2?.(exportData, excelName, () => {}, true);
  };

  watch(
    () => props.curLable,
    (val) => {
      if (val) {
        radioValue.value = val.value || 1;
      }
    },
    { immediate: true },
  );

  watch(
    [radioValue, curMonth, curSelect],
    () => {
      if (radioValue.value && curMonth.value) {
        portraitData.value = { ...portraitData.value, 9: {} };
        getPortrait();
      }
    },
    { immediate: true },
  );
</script>

<style lang="less" scoped>
  @import './index.less';
</style>
