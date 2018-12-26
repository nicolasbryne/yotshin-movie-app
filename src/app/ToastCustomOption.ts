import {ToastOptions} from 'ng2-toastr';

export class ToastCustomOption extends ToastOptions {
  animate = 'flyRight'; // you can override any options available
  newestOnTop = true;
  showCloseButton = true;
  positionClass = 'toast-bottom-right';
  toastLife= 3000;
}