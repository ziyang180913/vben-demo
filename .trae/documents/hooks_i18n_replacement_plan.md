# Hooks 国际化替换计划

## [ ] 任务 1: 分析 useMessage.tsx 中的国际化调用
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 识别 useMessage.tsx 中所有使用 `t()` 函数的国际化调用
  - 记录每个国际化键及其对应的中文翻译
- **Success Criteria**:
  - 完整列出所有国际化键及其中文翻译
- **Test Requirements**:
  - `programmatic` TR-1.1: 确认所有 `t()` 调用都被识别
  - `human-judgement` TR-1.2: 翻译准确性检查

## [ ] 任务 2: 分析 useTitle.ts 中的国际化调用
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 识别 useTitle.ts 中所有使用 `t()` 函数的国际化调用
  - 记录每个国际化键及其对应的中文翻译
- **Success Criteria**:
  - 完整列出所有国际化键及其中文翻译
- **Test Requirements**:
  - `programmatic` TR-2.1: 确认所有 `t()` 调用都被识别
  - `human-judgement` TR-2.2: 翻译准确性检查

## [ ] 任务 3: 替换 useMessage.tsx 中的国际化调用为中文字符串
- **Priority**: P0
- **Depends On**: 任务 1
- **Description**:
  - 将 useMessage.tsx 中所有 `t('common.xxx')` 调用替换为直接的中文字符串
  - 移除 useI18n 导入
  - 保持代码结构和功能不变
- **Success Criteria**:
  - 所有 `t()` 调用都被替换为中文字符串
  - useI18n 导入已被移除
  - 代码语法正确，无编译错误
- **Test Requirements**:
  - `programmatic` TR-3.1: 确认文件中不再有 `t()` 调用
  - `programmatic` TR-3.2: 确认 useI18n 导入已被移除
  - `human-judgement` TR-3.3: 中文字符串显示正确

## [ ] 任务 4: 替换 useTitle.ts 中的国际化调用为中文字符串
- **Priority**: P0
- **Depends On**: 任务 2
- **Description**:
  - 将 useTitle.ts 中所有 `t()` 调用替换为直接的中文字符串
  - 移除 useI18n 导入
  - 保持代码结构和功能不变
- **Success Criteria**:
  - 所有 `t()` 调用都被替换为中文字符串
  - useI18n 导入已被移除
  - 代码语法正确，无编译错误
- **Test Requirements**:
  - `programmatic` TR-4.1: 确认文件中不再有 `t()` 调用
  - `programmatic` TR-4.2: 确认 useI18n 导入已被移除
  - `human-judgement` TR-4.3: 中文字符串显示正确

## [ ] 任务 5: 验证修改后的代码
- **Priority**: P1
- **Depends On**: 任务 3, 任务 4
- **Description**:
  - 检查代码语法是否正确
  - 确认功能逻辑保持不变
- **Success Criteria**:
  - 代码语法正确
  - 功能逻辑保持不变
- **Test Requirements**:
  - `programmatic` TR-5.1: 确认代码语法正确
  - `human-judgement` TR-5.2: 代码可读性和逻辑正确性检查