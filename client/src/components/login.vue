<template>

    <v-row
        align="center"
        justify="space-around"
    >
        <v-card
        elevation="10"
        width="400px"
        class="ma-10"
        >
        <v-card-text>
        <div v-if="authMethods.local">
            <v-alert
                v-show="error"
                outlined
                type="warning"
                prominent
                border="left"
                >Wrong username or password!
            </v-alert>
            <form v-on:submit="login">
                <v-text-field
                    label="username"
                    name="username"
                    required
                ></v-text-field>
                <v-text-field
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
            <p></p>
        </div>
        <v-divider v-if="authMethods.local && authMethods.github"></v-divider>
        <p></p>
        <div v-if="authMethods.github">
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
        </div>
        </v-card-text>
        </v-card>
    </v-row>
</template>

<script>
    import router from "../router"
    import axios from "axios"
    export default {
        name: "Login",
        data: () => ({
            error: false,
            authMethods : {
                "local": false,
                "github": false
            }
        }),
        mounted() {
            this.getAuthMethods();
        },
        methods: {
            getAuthMethods() {
                axios
                    .get("/api/auth/methods")
                    .then((result) => {
                        console.log(result.data)
                        this.authMethods = result.data
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            },
            login: function (e) {
                e.preventDefault()
                let username = e.target.elements.username.value
                let password = e.target.elements.password.value
                let login = () => {
                    let data = {
                        username: username,
                        password: password
                    }
                    axios.post("/api/login", data)
                        .then((response) => {
                            console.log("Logged in"+response)
                            router.push("/")
                        })
                        .catch((errors) => {
                            this.error = true;
                            console.log("Cannot log in"+errors)
                        })
                }
                login()
            }
        }
    }
</script>