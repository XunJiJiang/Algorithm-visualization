// @ts-ignore
import Msg from '../message';

const dialogContainer = document.getElementById('dialog-container') as HTMLDivElement;
const dialogContent = document.getElementById('dialog') as HTMLDivElement;
const dialogForm = document.getElementById('dialog-form') as HTMLFormElement;
const btn = document.getElementsByClassName('dialog-btn') as unknown as HTMLButtonElement[];
// 对象类型的dialog内表单组件
type DialogCompObj = {
  type: 'text' | 'number';
  value: string | number;
  label: string;
  placeholder: string;
  min?: number;
  max?: number;
  pattern?: string;
  check?: (value: string | number, ...args: any[]) => boolean | string;
  input?: HTMLInputElement;
};

function visibleDialog(visible: boolean) {
  if (visible) {
    dialogContainer.style.display = 'flex';
    setTimeout(() => {
      dialogContainer.style.opacity = '1';
      dialogContent.style.transform = 'scale(1)';
    }, 10);
  } else {
    dialogContainer.style.opacity = '0';
    dialogContent.style.transform = 'scale(0.95)';
    setTimeout(() => {
      dialogContainer.style.display = 'none';
    }, 300);
  }
}

export const createDialog = (
  comp: DialogCompObj[],
  submitFunc: (props: any[]) => any,
  renderFunc: () => any,
  cancelFunc: () => void
) => {
  dialogForm.innerHTML = '';
  comp.forEach(item => {
    const div = document.createElement('div');
    const label = document.createElement('label');
    const input = document.createElement('input');
    label.innerText = item.label;
    input.type = item.type;
    input.name = item.label;
    input.value = item.value as string;
    input.placeholder = item.placeholder;
    if (item.type === 'number') {
      input.min = (item.min ?? 1).toString();
      input.max = (item.max ?? 10).toString();
    } else {
      input.pattern = item.pattern ?? '.*';
    }
    div.appendChild(label);
    div.appendChild(input);
    dialogForm.appendChild(div);
    item.input = input;
  });
  let resolve: (value: any) => void, reject: (reason?: any) => void;
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  promise.finally(() => {
    visibleDialog(false);
  });
  // 取消
  btn[0].onclick = () => {
    cancelFunc();
    reject();
  };
  // 随机
  btn[1].onclick = () => {
    resolve(renderFunc());
  };
  // 提交
  btn[2].onclick = () => {
    dialogForm.dispatchEvent(new Event('submit'));
  };
  dialogForm.onsubmit = e => {
    e.preventDefault();
    let isCheck = true;
    const values = [] as any[];
    comp.forEach(item => {
      const input = item.input as HTMLInputElement;
      const _checkValue = (item.check && item.check(input.value, ...values)) ?? true;
      if (_checkValue === false || typeof _checkValue === 'string') {
        Msg.message({
          type: 'error',
          message: _checkValue ? _checkValue : `${item.label}输入不合法`,
        });
        isCheck = false;
        return;
      }
      values.push(input.value);
      input.setCustomValidity('');
    });
    if (!isCheck) return;
    const data = new FormData(dialogForm);
    const obj = {} as any;
    for (const [key, value] of data.entries()) {
      obj[key] = value;
    }
    const result = submitFunc(Object.values(obj));
    resolve(result);
  };
  visibleDialog(true);
  return promise;
};
