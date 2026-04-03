import type { AppRouteModule } from '@/router/types';

import { getParentLayout, LAYOUT } from '@/router/constant';

// 基础数据平台
const basicData: AppRouteModule = {
  path: '/basicdata',
  name: 'BasicData',
  component: LAYOUT,
  redirect: '/basicdata/grid',
  meta: {
    icon: 'ion:bar-chart-outline',
    title: '基础数据平台',
  },
  children: [
    {
      path: '/basicdata/grid',
      name: 'DataGrid',
      component: getParentLayout('DataGrid'),
      meta: {
        title: '数据网格',
      },
      redirect: '/basicdata/grid/population',
      children: [
        {
          path: '/basicdata/grid/population',
          name: 'Population',
          component: () => import('@/views/basicdata/grid/population/index.vue'),
          meta: {
            title: '人口分布',
          },
        },
        {
          path: '/basicdata/grid/industry',
          name: 'Industry',
          component: () => import('@/views/basicdata/grid/industry/index.vue'),
          meta: {
            title: '产业分布',
          },
        },
        {
          path: '/basicdata/grid/traveler',
          name: 'Traveler',
          component: () => import('@/views/basicdata/grid/traveler/index.vue'),
          meta: {
            title: '差旅分布',
          },
        },
        {
          path: '/basicdata/grid/city-gather',
          name: 'CityGather',
          component: () => import('@/views/basicdata/grid/city-gather/index.vue'),
          meta: {
            title: '差旅聚客圈分布',
          },
        },
      ],
    },
    {
      path: '/basicdata/guest-research',
      name: 'GuestResearch',
      component: getParentLayout('GuestResearch'),
      meta: {
        title: 'POI客研',
      },
      redirect: '/basicdata/guest-research/mall',
      children: [
        {
          path: '/basicdata/guest-research/mall',
          name: 'Mall',
          component: () => import('@/views/basicdata/guest-research/mall/index.vue'),
          meta: {
            title: '商场客研',
          },
        },
      ],
    },
  ],
};

export default basicData;
