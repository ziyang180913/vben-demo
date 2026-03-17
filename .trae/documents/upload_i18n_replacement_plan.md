# Upload 组件国际化替换计划

## [ ] 任务 1: 分析文件中的国际化调用
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 识别文件中所有使用 `t()` 函数的国际化调用
  - 记录每个国际化键及其对应的中文翻译
- **Success Criteria**:
  - 完整列出所有国际化键及其中文翻译
- **Test Requirements**:
  - `programmatic` TR-1.1: 确认所有 `t()` 调用都被识别
  - `human-judgement` TR-1.2: 翻译准确性检查

## [ ] 任务 2: 替换国际化调用为中文字符串
- **Priority**: P0
- **Depends On**: 任务 1
- **Description**:
  - 将所有 `t('component.upload.xxx')` 调用替换为直接的中文字符串
  - 保持代码结构和功能不变
- **Success Criteria**:
  - 所有 `t()` 调用都被替换为中文字符串
  - 代码语法正确，无编译错误
- **Test Requirements**:
  - `programmatic` TR-2.1: 确认文件中不再有 `t()` 调用
  - `human-judgement` TR-2.2: 中文字符串显示正确

## [ ] 任务 3: 移除不必要的导入
- **Priority**: P1
- **Depends On**: 任务 2
- **Description**:
  - 移除 `useI18n` 导入
  - 移除其他不再使用的导入（如果有）
- **Success Criteria**:
  - 文件中不再有 `useI18n` 导入
  - 无未使用的导入
- **Test Requirements**:
  - `programmatic` TR-3.1: 确认 `useI18n` 导入已被移除
  - `programmatic` TR-3.2: 确认无未使用的导入

## [ ] 任务 4: 验证修改后的代码
- **Priority**: P0
- **Depends On**: 任务 2, 任务 3
- **Description**:
  - 检查代码语法是否正确
  - 确认功能逻辑保持不变
  - 运行项目构建确保无错误
- **Success Criteria**:
  - 代码语法正确
  - 项目构建成功
- **Test Requirements**:
  - `programmatic` TR-4.1: 运行 `npm run build` 确认无错误
  - `human-judgement` TR-4.2: 代码可读性和逻辑正确性检查