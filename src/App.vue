<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <v-toolbar-title>Event Planner</v-toolbar-title>
      </div>

      <v-spacer></v-spacer>

      <v-btn
        href="https://github.com/vuetifyjs/vuetify/releases/latest"
        target="_blank"
        text
      >
        Login
      </v-btn>
    </v-app-bar>

    <v-content>
      <v-container>
        <v-row class="text-center">
          <v-col class="mb-4">
            <h1 class="display-2 font-weight-bold mb-3">
              Welcome to Vuetify
            </h1>

            <p class="subheading font-weight-regular">
              Manage all your personal Events in One convenient location
            </p>
          </v-col>

          <v-col cols="12">
            <v-btn color="primary">
              Login with Auth0
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import HelloWorld from "./components/HelloWorld";

export default {
  name: "App",

  components: {
    HelloWorld
  },

  data: () => ({
    //
  })
};
</script>
