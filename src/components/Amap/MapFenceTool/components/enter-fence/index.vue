<template>
  <Modal
    title="录入围栏"
    :open="open"
    :width="960"
    :style="{ padding: '20px' }"
    @cancel="handleCancel"
    destroyOnClose
    :getContainer="false"
    @ok="handleOk"
  >
    <Form v-bind="layout">
      <Form.Item label="多边形围栏" v-bind="validateInfos.fence">
        <TextArea
          :rows="4"
          v-model:value="modelRef.fence"
          placeholder="GeoJson Polygons: [[22,33],[66,33],[55,33],[77,33],[99,33]]"
        />
      </Form.Item>
      <Form.Item label="围栏坐标系" v-bind="validateInfos.coordinate">
        <Radio.Group v-model:value="modelRef.coordinate">
          <Radio value="WGS84">WGS84</Radio>
          <Radio value="BD09">BD09</Radio>
          <Radio value="GCJ02">GCJ02</Radio>
        </Radio.Group>
      </Form.Item>
    </Form>
  </Modal>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';
  import { Form, Input, Modal, Radio } from 'ant-design-vue';
  import type { Rule } from 'ant-design-vue/es/form';

  const { TextArea } = Input;
  const useForm = Form.useForm;

  const layout = {
    wrapperCol: {
      span: 18,
    },
    labelCol: {
      span: 4,
    },
  };

  // 定义围栏坐标类型
  type FenceCoordinates = [number, number][];

  const props = withDefaults(
    defineProps<{
      open: boolean;
      content?: string;
    }>(),
    {
      content: '',
    },
  );

  const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (
      e: 'submit',
      values: { fence: string; coordinate: 'WGS84' | 'BD09' | 'GCJ02' },
      resetForm: () => void,
    ): void;
  }>();

  const fenceValidator = (_: Rule, value: string) => {
    const msg = '输入的坐标点格式错误，示例：[[22,33],[66,33],[55,33],[77,33],[99,33]]';
    if (!value) return Promise.resolve();
    try {
      // 去除空格，换行，制表符
      const str = value.replace(/\s*/g, '');
      const arr: FenceCoordinates = JSON.parse(str);
      if (!Array.isArray(arr)) {
        return Promise.reject(new Error(msg));
      }
      // 坐标点不得少于三个
      if (arr.length < 3) {
        return Promise.reject(new Error('输入的坐标点小于3个。'));
      }
      // 具体出错数据
      let err: number[] = [];
      // 判断经纬度值是否正确
      const isLatLng = arr.every((item) => {
        if (item[0] && item[1] && item[0] > 0 && item[0] < 180 && item[1] > 0 && item[1] < 90) {
          return true;
        }
        err = item;
        return false;
      });
      if (!isLatLng) {
        return Promise.reject(
          new Error(
            err.length ? `出错数据为：${JSON.stringify(err)},经度：0 - 180， 维度：0 - 90` : msg,
          ),
        );
      }
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(new Error(msg));
    }
  };

  // 表单字段
  const modelRef = reactive({
    fence: '',
    coordinate: 'BD09' as 'WGS84' | 'BD09' | 'GCJ02',
  });

  // 表单验证规则
  const rulesRef = reactive({
    fence: [
      {
        required: true,
        message: '请填写围栏数据！',
      },
      {
        validator: fenceValidator,
      },
    ],
    coordinate: [
      {
        required: true,
        message: '请选择围栏坐标系！',
      },
    ],
  });

  const { resetFields, validate, validateInfos } = useForm(modelRef, rulesRef, {});

  const handleOk = async () => {
    try {
      const values = await validate();
      emit('submit', values as any, () => resetFields());
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const handleCancel = () => {
    emit('update:open', false);
    // 重置表单
    resetFields();
  };
</script>
