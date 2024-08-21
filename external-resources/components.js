import { LitElement, html } from './lib/lit-all.min.js';
import { postSetVariable, postStatemachineEvent, startListeningToRuntimePostMessageEvents, startListeningToVariableDeclarationRequests } from './lib/ib.js';

export class IBNavigation extends LitElement {

    static properties = {
        textPages: { type: Array },
        taskPages: { type: Array },
        menuTitle: { type: String },
        titleFontSize: { type: String },
        currentPage: { attribute: false },
    }

    constructor() {
        super();
        this.traceCount = 0;
        this.reachedTasks = false;
        this._currentPage = 0;
        this._textPages = [];
        this._taskPages = [];
    }


    get taskPages(){
        return this._taskPages;
    }    
    set taskPages(pages){

        if(!Array.isArray(pages))
            return;

        let oldValue = this._taskPages.slice();
        this._taskPages = pages.map(p => {
            return {
                ...p, 
                type: "taskPage",
                visited: 0,
                solved: 0
            }
        });
        this.requestUpdate('taskPages', oldValue);
    }


    get textPages(){
        return this._textPages;
    }
    set textPages(pages){

        if(!Array.isArray(pages))
            return;

        let oldValue = this._textPages.slice();
        this._textPages = pages.map(p => {
            return {
                ...p, 
                type: "textPage",
                visited: 0
            }
        });
        this._textPages[0].visited = 1;
        this.requestUpdate('taskPages', oldValue);
    }


    get pages() {
        if (Array.isArray(this.textPages) && Array.isArray(this.taskPages)){
            return this.textPages.concat(this.taskPages);
        }
        return [];
    }

    get currentPage() {
        return this._currentPage;
    }

    set currentPage(p) {
        if (p >= 0 && p <= this.pages.length - 1) {
            let oldPage = this._currentPage;
            this._currentPage = p;
            const currentPageObject = this.pages[p];
            let visited = 0;
            if (currentPageObject?.type == "taskPage"){
                this.reachedTasks = true;
                this.taskPages.forEach((t,i) => {
                    if(t.navigateEventName == this.pages[p].navigateEventName){
                        t.visited++; visited = t.visited;
                    }
                });
            }
            if (currentPageObject?.type == "textPage"){
                this.textPages.forEach((t,i) => {
                    if(t.navigateEventName == this.pages[p].navigateEventName){
                        t.visited++; visited = t.visited;
                    }
                });                   
            }
            postStatemachineEvent(currentPageObject?.navigateEventName, this.traceCount++);
            if(currentPageObject?.type == "taskPage")
                postSetVariable(currentPageObject?.countVisitsVariableName, visited);
            this.requestUpdate("currentPage", oldPage);
        }
    }

    get hasNext() {
        return this.currentPage < (this.pages.length - 1);
    }

    get hasPrev() {
        return this.currentPage > 0;
    }

    //shadow to light
    createRenderRoot() {
        return this;
    }


    
    getVariableResultCallback = (name, type, value, callId) => {
        console.log(name, type, value, callId);
    }

    acceptOperatorMessage = (data) => {
        console.log(data);
        let upd = false;
        if(Array.isArray(data)){
            data.forEach(e => {
                this.taskPages.forEach((t,i) => {
                    if(t.solvedEventName == e){
                        t.solved = true;
                        upd = true;
                    }
                })
            })
        }

        // Solved_All variable setzen

        if(upd)
            this.requestUpdate();
    }

    declareVariables = () => {
        if(this._taskPages && Array.isArray(this._taskPages) && this._taskPages.length){
            try {                
                return this._taskPages.map(p => {
                    return {
                        name: p.countVisitsVariableName,
                        type: "Integer",
                        defaultValue: 0,
                        namedValues: []
                    }
                })
            } catch (error) {
                console.error(error);
                return [];
            }
        }
    }

    connectedCallback(){
        super.connectedCallback();
        // startListeningToRuntimePostMessageEvents(this.getVariableResultCallback, this.acceptOperatorMessage)
        startListeningToRuntimePostMessageEvents(this.getVariableResultCallback, this.acceptOperatorMessage);
        // startListeningToVariableDeclarationRequests(this.declareVariables);
    }

    // update(changedProperties) {
    //     changedProperties.forEach((oldValue, propName) => {
    //         if(propName == "taskPages"){
    //             this.taskPages.forEach(p => { 
    //                 p.type = "taskPage";
    //                 p.visited = 0;
    //                 p.solved = false;
    //             });
    //         }
    //         else if(propName == "textPages"){
    //             this.taskPages.forEach(p => { 
    //                 p.type = "textPage";
    //                 p.visited = 0;
    //             });
    //         }
    //     });
    //     super.update(changedProperties);
    // }    

    next() {
        if (this.hasNext)
            this.currentPage++;
        else
            postStatemachineEvent('EndTask', this.traceCount++);
    }

    prev() {
        if (this.hasPrev)
            this.currentPage--;
    }

    goto(pageIndex) {      
        if (this.pages[pageIndex] && this.pages[pageIndex]?.navigateEventName)
            this.currentPage=pageIndex;
    }

    render() {
        const textPages = this.textPages.map((p, i) => {
            return html`
                <li 
                    @click="${() => this.goto(i)}"
                    class="cursor-pointer  ${!p?.visited ? 'font-bold' : 'font-semibold'} ${i == this.currentPage ? 'border-2 border-accent1 rounded-md' : 'p-[2px]'}"
                >
                    <div class="flex flex-row gap-2 items-center justify-center w-full ${p?.solved ? 'text-gray-600' : ''}">
                        <div>${p.pageName}</div>
                        <!--
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 ${!p?.solved? 'invisible' : ''}">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        -->
                    </div>
                </li>
            `
        });        
        const taskPages = this.taskPages.map((p, i) => {
            return html`
                <li 
                    @click="${() => this.goto(i+this.textPages.length)}"
                    class="cursor-pointer ${!p?.visited ? 'font-bold' : 'font-semibold'}  ${i+this.textPages.length == this.currentPage ? 'border-2 border-accent1 rounded-md' : 'p-[2px]'}"
                >
                    <div class="flex flex-row gap-2 items-center justify-center w-full ${p?.solved ? 'text-gray-600' : ''}">
                        <div>${p.pageName}</div>
                    </div>
                </li>
            `
        });
        return html`
            <div class="flex flex-col h-screen bg-accent2">
                ${this.menuTitle ? html`
                    <div style="font-size: ${this.titleFontSize}" class="p-4 w-full text-white font-bold text-center bg-accent1 border-b-2 border-black">
                        ${this.menuTitle}
                    </div>
                `: ""}                 
                <div class="p-4 bg-gray-300 w-full text-center border-b-2 border-black">
                    <ul  class="list-none text-xl p-2 bg-slate-400">
                        ${textPages}
                    </ul>
                    <ul class="list-none text-xl p-2 text-black ${!this.reachedTasks ? 'hidden' : ''}">
                        ${taskPages}
                    </ul>
                </div>    
                <div class="mt-4 flex-grow flex flex-col justify-end">
                    <div class="flex items-center justify-center gap-2 border-t-2 py-4 border-black">
                        <button class="disabled:opacity-40 disabled:cursor-not-allowed" type="button" ?disabled="${!this.hasPrev}" @click="${this.prev}"><img class="h-14" src="./assets/prev_page_1.png" /></button>
                        <button class="disabled:opacity-40 disabled:cursor-not-allowed" type="button" ?hidden="${!this.hasNext}" @click="${this.next}"><img class="h-14" src="./assets/next_page_1.png" /></button>
                        <button class="disabled:opacity-40 disabled:cursor-not-allowed" type="button" ?hidden="${this.hasNext}"  @click="${this.next}"><img class="h-14" src="./assets/next_unit_1.png" /></button>
                        <!--
                            <button class="bg-accent1 rounded-lg border border-slate-800 text-white font-bold px-4 disabled:opacity-40 disabled:cursor-not-allowed" type="button" ?disabled="${!this.hasPrev}" @click="${this.prev}"><img src="./assets/prev_page_1.png" /></button>
                            <button class="bg-accent1 rounded-lg border border-slate-800 text-white font-bold px-4 disabled:opacity-40 disabled:cursor-not-allowed" type="button"  @click="${this.next}"><img src="./assets/next_page_1.png" /></button>
                        -->
                    </div>
                </div>
            </div>
            <!-- 
            <div class="text-red-600">
                    ${this.currentPage}
                </div> 
            </div>      
            -->
         `;
    }
}

customElements.define('ib-navigation', IBNavigation);
