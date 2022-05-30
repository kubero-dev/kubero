<template>
<v-card
    class="mt-5"
    outlined
    elevation="2"
    >

    <v-card-title>MyApp-production</v-card-title>

    <v-card-text>
        <v-row
            class="mx-0"
        >
            <v-icon left small>mdi-github</v-icon>

            <div class="grey--text text-subtitle-1">
                myOrg/my-awesome-app
            </div>
        </v-row>
        <p></p>
        <v-chip label class="mr-1">Autodeploy | master</v-chip>
        <v-chip label class="mr-1">c142824f</v-chip>

    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="ml-2">
        <v-btn
            color="deep-purple lighten-2"
            text
            outlined
        >
            Promote to Production
        </v-btn>
        <v-btn
            color="deep-purple lighten-2"
            text
        >
            Open app
        </v-btn>
    </v-card-actions>
</v-card>
</template>

<style>
.v-btn.v-size--default {
    font-size: 0.675rem;
}

.mr-1.v-chip.v-size--default {
    font-size: 12px;
    height: 28px;
}

.v-application .text-subtitle-1 {
    font-size: 0.825rem !important;
}

.v-application .v-card__title {
    font-size: 1.1rem;
}
</style>