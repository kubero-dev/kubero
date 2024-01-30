<template>
    <div style="height: 95%;">
        <v-row justify="space-around" class="console-bar">
            <v-col cols="12" sm="5" md="5" lg="5">
                <v-select
                    v-model="pod"
                    label="Pod"
                    class="pa-1 ml-3"
                    :items=pods
                    item-title="name"
                    return-object
                ></v-select>
            </v-col>
            <v-col cols="12" sm="3" md="3" lg="3">
                <v-select
                    v-model="container"
                    label="Container"
                    class="pa-1"
                    :items=pod.containers
                ></v-select>
            </v-col>
            <v-col cols="12" sm="2" md="2" lg="2">
                <v-combobox
                    v-model="command"
                    label="Command"
                    class="pa-1"
                    :items="commands"
                ></v-combobox>
            </v-col>
            <v-col cols="12" sm="2" md="2" lg="2" class="mt-4">
                <v-btn @click="connect" color="primary" v-if="!connected">Run</v-btn>
                <v-btn @click="disconnect" color="primary" v-if="connected">Exit</v-btn>
            </v-col>
        </v-row>
        <!--
        <v-tabs class="console-bar">
            <v-tab>run</v-tab>
        </v-tabs>
        -->
        <div id="terminal"></div>
    </div>
</template>


<script lang="ts">
import axios from "axios";
import { Terminal, ITerminalOptions } from 'xterm';
import { ref, reactive, defineComponent } from 'vue'
import { useKuberoStore } from '../../stores/kubero'

const socket = useKuberoStore().kubero.socket as any;

type Pod = {
    name: string,
    containers: string[],
}

let termOptions = {
    cols: 110,
    rows: 40,
    cursorBlink: true,
    cursorInactiveStyle: 'underline',
} as ITerminalOptions;

const term = new Terminal(termOptions);

export default defineComponent({
    setup() {
        return {
            socket,
        }
    },
    mounted() {
        this.loadPods()
        //this.connectToFirstPod()
    },
    unmounted() {
        this.socketLeave()
    },
    props: {
      pipeline: {
        type: String,
        default: "MISSING"
      },
      phase: {
        type: String,
        default: "MISSING"
      },
      app: {
        type: String,
        default: "new"
      },
    },
    computed: {
        room(): string {
            return `${this.pipeline}-${this.phase}-${this.app}-${this.pod.name}-${this.container}-terminal`;
        }
    },
    data: () => ({
        connected: false,
        commands: ['sh', 'bash'] as string[],
        command: 'sh' as string,
        container: "MISSING" as string,
        pods: [{name: 'kubectl-kuberoapp-web-786b847d9f-4dw96', containers: ['kubero-web', 'example']}] as Pod[],
        pod: {name: 'kubectl-kuberoapp-web-786b847d9f-4dw96', containers: ['kubero-web', 'example']} as Pod,
    }),
    methods: {
        loadPods() {
            axios.get(`/api/status/pods/${this.pipeline}/${this.phase}`).then((response) => {
                //this.loadContainers();
                for (let pod of response.data) {
                    const p = {name: pod.name, containers: pod.containers.map((c: any) => c.name)} as Pod;
                    this.pods.push(p);
                }
            });
        },
        disconnect() {
            socket.emit("terminal", {
                room: this.room,
                data: "exit\r\nexit\r\nexit\r\nexit\r\nexit\r\n",
            });
            // wait a bit for the exit to be processed
            setTimeout(() => {
                this.socketLeave()
            }, 1000);
            this.connected = false;
            term.dispose()
        },
        connect() {
            this.createTerminal()
            this.socketJoin()
            this.execInContainer()
            this.connected = true;
        },
        connectToFirstPod() {
            if (this.pods.length == 0) {
                return
            }
            this.pod = this.pods[0];
            this.container = this.pod.containers[0];
            this.connect()
        },
        createTerminal() {
            //const room = `${this.pipeline}-${this.phase}-${this.app}-terminal`;
            term.open(document.getElementById('terminal') as HTMLElement);
            //term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')
            //term.clear()
            term.focus()
            
            socket.on("terminal", (data: any) => {
                console.log("terminal", data);
                term.write(data);
            });

            socket.on("consoleresponse", (data: any) => {
                term.write(data)
            })

            term.onData((data) => {
                //console.log("onData", data);

                socket.emit("terminal", {
                    room: this.room,
                    data: data,
                });
            });
            /*
            term.onResize((size) => {
                console.log("onResize", size);
                socket.emit("terminal", {
                    room: this.room,
                    data: size,
                });
            });
            term.onBinary((data) => {
                console.log("onBinary", data);
                socket.emit("terminal", {
                    room: this.room,
                    data: data,
                });
            });
            term.onTitleChange((title) => {
                console.log("onTitleChange", title);
                socket.emit("terminal", {
                    room: this.room,
                    data: title,
                });
            });
            
            /*
            term.onLineFeed(() => {
                console.log("onLineFeed");
                socket.emit("terminal", {
                    room: this.room,
                    data: "onLineFeed",
                });
            });
            */
            /*
            term.onSelectionChange(() => {
                console.log("onSelectionChange");
                socket.emit("terminal", {
                    room: this.room,
                    data: "onSelectionChange",
                });
            });
            /*
            term.onScroll(() => {
                console.log("onScroll");
                socket.emit("terminal", {
                    room: this.room,
                    data: "onScroll",
                });
            });
            /*
            term.onKey((key, ev) => {
                console.log("onKey", key, ev);
                socket.emit("terminal", {
                    room: `${this.pipeline}-${this.phase}-${this.app}`,
                    data: key,
                });
            });
            term.onRender((data) => {
                console.log("onRender", data);
                socket.emit("terminal", {
                    room: `${this.pipeline}-${this.phase}-${this.app}`,
                    data: data,
                });
            });
            */

        },
        socketJoin() {
            console.log("socketJoin", this.room);
            socket.emit("join", {
                room: this.room,
            });
        },
        socketLeave() {
            console.log("socketLeave", this.room);
            term.write("exit\r\n")
            socket.emit("leave", {
                room: this.room,
            });
        },
        execInContainer2() {
            axios.get(`/api/console/${this.pipeline}/${this.phase}/${this.app}/exec`).then(() => {
                console.log(`attached to container ${this.container}`);
            });
        },
        execInContainer(){
            axios.post(`/api/console/${this.pipeline}/${this.phase}/${this.app}/exec`, {
                podName: this.pod.name,
                containerName: this.container,
                command: this.command,
            }).then(() => {
                console.log(`attached to container ${this.container}`);
            });

        }
    },
});
</script>

<style lang="scss">

a:link { text-decoration: none;}
.v-icon.v-icon {
    vertical-align:inherit;
}

.v-tabs.console-bar {
    color: #9F9F9F;
}

.v-tabs.console-bar {
    background-color: #1E1E1E; /*#444*/
}

.v-row.console-bar {
    background-color: #1E1E1E; /*#444*/
    color: #9F9F9F;
}

.v-application {
    background-color: #1E1E1E; /*#444*/
}

.console {
    height: 100%;
    overflow-x: scroll;
    background-color: #333;
    color: #c0c0c0;
    padding: 5px;
    font: 0.85rem Inconsolata, monospace;

    display: flex;
    flex-direction: column-reverse;
}


/**
 * Copyright (c) 2014 The xterm.js authors. All rights reserved.
 * Copyright (c) 2012-2013, Christopher Jeffrey (MIT License)
 * https://github.com/chjj/term.js
 * @license MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Originally forked from (with the author's permission):
 *   Fabrice Bellard's javascript vt100 for jslinux:
 *   http://bellard.org/jslinux/
 *   Copyright (c) 2011 Fabrice Bellard
 *   The original design remains. The terminal itself
 *   has been extended to include xterm CSI codes, among
 *   other features.
 */

/**
 *  Default styles for xterm.js
 */

 .xterm {
    cursor: text;
    position: relative;
    user-select: none;
    -ms-user-select: none;
    -webkit-user-select: none;
}

.xterm.focus,
.xterm:focus {
    outline: none;
}

.xterm .xterm-helpers {
    position: absolute;
    top: 0;
    /**
     * The z-index of the helpers must be higher than the canvases in order for
     * IMEs to appear on top.
     */
    z-index: 5;
}

.xterm .xterm-helper-textarea {
    padding: 0;
    border: 0;
    margin: 0;
    /* Move textarea out of the screen to the far left, so that the cursor is not visible */
    position: absolute;
    opacity: 0;
    left: -9999em;
    top: 0;
    width: 0;
    height: 0;
    z-index: -5;
    /** Prevent wrapping so the IME appears against the textarea at the correct position */
    white-space: nowrap;
    overflow: hidden;
    resize: none;
}

.xterm .composition-view {
    /* TODO: Composition position got messed up somewhere */
    background: #000;
    color: #FFF;
    display: none;
    position: absolute;
    white-space: nowrap;
    z-index: 1;
}

.xterm .composition-view.active {
    display: block;
}

.xterm .xterm-viewport {
    /* On OS X this is required in order for the scroll bar to appear fully opaque */
    background-color: #000;
    overflow-y: scroll;
    cursor: default;
    position: absolute;
    right: 0;
    left: 0;
    top: 0;
    bottom: 0;
}

.xterm .xterm-screen {
    position: relative;
}

.xterm .xterm-screen canvas {
    position: absolute;
    left: 0;
    top: 0;
}

.xterm .xterm-scroll-area {
    visibility: hidden;
}

.xterm-char-measure-element {
    display: inline-block;
    visibility: hidden;
    position: absolute;
    top: 0;
    left: -9999em;
    line-height: normal;
}

.xterm.enable-mouse-events {
    /* When mouse events are enabled (eg. tmux), revert to the standard pointer cursor */
    cursor: default;
}

.xterm.xterm-cursor-pointer,
.xterm .xterm-cursor-pointer {
    cursor: pointer;
}

.xterm.column-select.focus {
    /* Column selection mode */
    cursor: crosshair;
}

.xterm .xterm-accessibility:not(.debug),
.xterm .xterm-message {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 10;
    color: transparent;
    pointer-events: none;
}

.xterm .xterm-accessibility-tree:not(.debug) *::selection {
  color: transparent;
}

.xterm .xterm-accessibility-tree {
  user-select: text;
  white-space: pre;
}

.xterm .live-region {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
}

.xterm-dim {
    /* Dim should not apply to background, so the opacity of the foreground color is applied
     * explicitly in the generated class and reset to 1 here */
    opacity: 1 !important;
}

.xterm-underline-1 { text-decoration: underline; }
.xterm-underline-2 { text-decoration: double underline; }
.xterm-underline-3 { text-decoration: wavy underline; }
.xterm-underline-4 { text-decoration: dotted underline; }
.xterm-underline-5 { text-decoration: dashed underline; }

.xterm-overline {
    text-decoration: overline;
}

.xterm-overline.xterm-underline-1 { text-decoration: overline underline; }
.xterm-overline.xterm-underline-2 { text-decoration: overline double underline; }
.xterm-overline.xterm-underline-3 { text-decoration: overline wavy underline; }
.xterm-overline.xterm-underline-4 { text-decoration: overline dotted underline; }
.xterm-overline.xterm-underline-5 { text-decoration: overline dashed underline; }

.xterm-strikethrough {
    text-decoration: line-through;
}

.xterm-screen .xterm-decoration-container .xterm-decoration {
	z-index: 6;
	position: absolute;
}

.xterm-screen .xterm-decoration-container .xterm-decoration.xterm-decoration-top-layer {
	z-index: 7;
}

.xterm-decoration-overview-ruler {
    z-index: 8;
    position: absolute;
    top: 0;
    right: 0;
    pointer-events: none;
}

.xterm-decoration-top {
    z-index: 2;
    position: relative;
}


</style>