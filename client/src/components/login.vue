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
                error: false
        }),
        methods: {
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