<template>

    <v-row
        align="center"
        justify="space-around"
    >
        <v-card
        elevation="10"
        width="400px"
        class="ma-10"
        style="margin-top: 300px !important;"
        >
        <v-card-text>
        <v-img
            src="/img/icons/hexagon3.svg"
            max-height="100"
            max-width="100"
            class="mx-auto"
        ></v-img>


        <!-- Show info panel if domain is demo.kubero.dev -->
        <v-alert
            v-if="isDemoDomain"
            type="info"
            border="start"
            class="mt-5"
        >
            User: <b>demo</b><br>
            Pass: <b>demo</b>
        </v-alert>
        <div v-if="authMethods.local" class="py-5">
            <v-alert
                v-show="error"
                type="warning"
                border="start"
                class="mb-5"
                :class="{ 'shaking': errorshake }"
                >Wrong username or password!
            </v-alert>
            <form v-on:submit="login">
                <v-text-field
                    v-model="username"
                    label="username"
                    name="username"
                    required
                ></v-text-field>
                <v-text-field
                    v-model="password"
                    label="password"
                    type="password"
                    name="password"
                    required
                ></v-text-field>
                <v-btn
                    depressed
                    color="primary"
                    type="submit"
                >Login</v-btn>
            </form>
        </div>
        <v-divider v-if="authMethods.local && authMethods.github"></v-divider>
        <div v-if="authMethods.github" class="py-5">
            <v-btn
                block
                depressed
                color="#24292f"
                href="/api/auth/github"
                style='color:white !important'>
                <v-icon left
                style='color:white !important'>
                    mdi-github
                </v-icon>
                Login with Github
            </v-btn>
        </div>        <p></p>
        <v-divider v-if="(authMethods.local || authMethods.github) && authMethods.oauth2"></v-divider>
        <p></p>
        <div v-if="authMethods.oauth2" class="py-5">
            <v-btn
                block
                depressed
                color_not="#3C79A6"
                color="#AA4242"
                href="/api/auth/oauth2"
                style='color:white !important'>
                <v-icon left
                style='color:white !important'>
                    mdi-cog
                </v-icon>
                Login with Oauth2
            </v-btn>
        </div>
        </v-card-text>
        </v-card>
    </v-row>
</template>

<script lang="ts">
import router from "../router"
import axios from "axios"
import { defineComponent } from 'vue'

import { useCookies } from "vue3-cookies";
const { cookies } = useCookies();

export default defineComponent({
    name: "Login",
    data: () => ({
        error: false,
        errorshake: false,
        username: '',
        password: '',
        authMethods : {
            "local": false,
            "github": false,
            "oauth2": false
        }
    }),
    computed: {
        isDemoDomain(): boolean {
            const demoDomains = [
                'demo.kubero.dev',
                //'kubero.localhost',
                //'localhost'
            ];
            const demoDomain = demoDomains.includes(window.location.hostname)
            if (demoDomain) {
                this.username = 'demo';
                this.password = 'demo';
            }
            return demoDomain;
        }
    },
    mounted() {
        this.getAuthMethods();
    },
    methods: {
        getAuthMethods() {
            axios
                .get("/api/auth/methods")
                .then((result) => {
                    //console.log(result.data)
                    this.authMethods = result.data
                })
                .catch((err) => {
                    console.log(err)
                })
        },
        login: function (e: any) {
            e.preventDefault()
            let username = e.target.elements.username.value
            let password = e.target.elements.password.value
            let login = () => {
                let data = {
                    username: username,
                    password: password
                }
                axios.post("/api/auth/login", data)
                    .then((response) => {
                        //console.log("Logged in"+response)

                        // Save topen token in local storage
                        //localStorage.setItem("kubero.JWT_TOKEN", response.data.access_token);

                        const token = cookies.set("kubero.JWT_TOKEN", response.data.access_token);
                        window.location.href = "/"
                    })
                    .catch((errors) => {
                        this.error = true;
                        this.errorshake = true;
                        setTimeout(() => {
                            this.errorshake = false;
                        }, 300);
                        console.log("Cannot log in"+errors)
                    })
            }
            login()
        },
        github() {
            axios.get("/api/auth/github")
                .then((response) => {
                    //console.log("Logged in"+response)

                    // Save topen token in local storage
                    //localStorage.setItem("kubero.JWT_TOKEN", response.data.access_token);

                    const token = cookies.set("kubero.JWT_TOKEN", response.data.access_token);
                    window.location.href = "/"
                })
                .catch((errors) => {
                    this.error = true;
                    console.log("Cannot log in"+errors)
                })
        }
    }
});
</script>

<style scoped>
/* https://unused-css.com/blog/css-shake-animation/ */
@keyframes horizontal-shaking {
 0% { transform: translateX(0) }
 25% { transform: translateX(5px) }
 50% { transform: translateX(-5px) }
 75% { transform: translateX(5px) }
 100% { transform: translateX(0) }
}
.shaking {
    animation: horizontal-shaking 0.3s ease-in-out;
}
</style>