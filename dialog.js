export default class Dialog extends EventTarget {
    constructor(options) {
        super();
        // 默认配置
        let defalultOptions = {
            width: "30%",
            height: "250px",
            title: "测试标题",
            content: "测试内容",
            dragable: true, //是否可拖拽
            maskable: true, //是否有遮罩
            isCancel: false, //是否有取消
            success() { },
            cancel() { }
        }
        // 合并配置；
        this.opts = Object.assign(defalultOptions, options);
        this.init();
    }
    // 初始化组件方法
    init() {
        this.createElement();
        // 监听success事件
        this.addEventListener("success", this.opts.success)
        this.addEleEvent();
        // 是否有遮罩层
        if (!this.opts.maskable) {
            this.divEles.querySelector(".k-wrapper").style.display = "none";
        }
        // 是否可拖拽
        if (this.opts.dragable) {
            // drag调用后给给鼠标事件绑定了处理函数
            this.drag();
        }
    }
    // 创建节点
    createElement() {
        let divEles = document.createElement("div");
        divEles.innerHTML = `<div class="k-wrapper"></div>
        <div class="k-dialog" style="width:${this.opts.width};height:${this.opts.height}">
            <div class="k-header">
                <span class="k-title">${this.opts.title}</span><span class="k-close">X</span>
            </div>
            <div class="k-body">
                <span>${this.opts.content}</span>
            </div>
            <div class="k-footer">
                ${this.opts.isCancel ? '<span class="k-default">取消</span>' : ''}
                <span class="k-primary">确定</span>
            </div>
        </div>`;
        divEles.style.display = "none";
        document.body.appendChild(divEles);
        this.divEles = divEles;
    }
    // 添加事件
    addEleEvent() {
        // 事件委托
        let kDialog = this.divEles.querySelector(".k-dialog");
        kDialog.addEventListener("click", e => {
            let className = e.target.className;
            switch (className) {
                case 'k-close':
                    this.close();
                    break;
                case 'k-default':
                    this.opts.cancel();
                    this.close();
                    break;
                case 'k-primary':
                    this.sure();
                    this.close();
                    break;
                default:
                    break;
            }

        })
    }
    sure(value) {
        // 创建一个自定义事件
        console.log('1.这里调用success事件的处理函数');
        // 向一个指定的事件目标派发一个事件
        this.dispatchEvent(new CustomEvent("success", {
            // detail在自定义事件的处理函数中可拿到
            detail: value
        }));
    }
    // 关闭组件
    close() {
        this.divEles.style.display = "none";
    }
    // 打开组件
    open() {
        this.divEles.style.display = "block";
    }
    drag() {
        let kDialog = this.divEles.querySelector(".k-dialog");
        kDialog.onmousedown = function (e) {
            let x = e.clientX - this.offsetLeft;
            let y = e.clientY - this.offsetTop;
            this.onmousemove = function (e) {
                let xx = e.clientX;
                let yy = e.clientY;
                this.style.left = xx - x + "px";
                this.style.top = yy - y + "px";
            }
            document.onmouseup = function () {
                kDialog.onmousemove = "";
            }
        }
    }
}

// 通过继承扩展功能；
// 创建input框
export class InputDialog extends Dialog {
    constructor(options) {
        super(options);
        this.createInput();
    }
    createInput() {
        let myInput = document.createElement("input");
        myInput.classList.add("input-inner");
        this.divEles.querySelector(".k-body").appendChild(myInput);
        this.myInput = myInput;
    }
    // 重写sure
    sure() {
        let value = this.myInput.value;
        super.sure(value);
    }
}

// Customized built-in elements 
class ShowDialog extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `<button>按钮</button>`;
        let dialog = new Dialog({
            title: this.title,
            success: () => {
                console.log('2.这是传入的success');
                this.dispatchEvent(new CustomEvent("success"))
            }
        })
        // 给这个自定义组件的click事件绑定处理函数
        this.onclick = function () {
            dialog.open();
        }
    }
    // getter
    get title() {
        return this.getAttribute("title") ?? "默认标题"
    }
}

customElements.define("show-dialog", ShowDialog);

/*
    custom element 点击确定时，调用sure，sure里调用dispatch，dispatch调用success的处理函数，即option.success
*/