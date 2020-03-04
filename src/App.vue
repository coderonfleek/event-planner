<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <v-toolbar-title
          >Event Planner
          <span v-if="$auth.isAuthenticated"
            >( {{ $auth.user.name }} )</span
          ></v-toolbar-title
        >
      </div>

      <v-spacer></v-spacer>

      <v-btn v-if="!$auth.isAuthenticated" @click="login()" text>
        Login
      </v-btn>
      <v-btn v-else @click="logout()" text>
        Logout
      </v-btn>
    </v-app-bar>

    <v-content>
      <v-container>
        <v-row class="text-center" v-if="!$auth.isAuthenticated">
          <v-col class="mb-4">
            <h1 class="display-2 font-weight-bold mb-3">
              Welcome to Vuetify
            </h1>

            <p class="subheading font-weight-regular">
              Manage all your personal Events in One convenient location
            </p>

            <p>
              <v-btn color="primary" @click="login()">
                Login with Auth0
              </v-btn>
            </p>
          </v-col>
        </v-row>
        <v-row v-else>
          <v-col cols="6">
            <h2>Events</h2>

            <div>
              <v-list two-line>
                <v-list-item-group v-model="selectedEvent" multiple>
                  <template v-for="(item, index) in events">
                    <v-list-item :key="item.event_name">
                      <template v-slot:default="{ active, toggle }">
                        <v-list-item-content>
                          <v-list-item-title
                            class="blue--text"
                            v-text="item.event_name"
                          ></v-list-item-title>
                          <v-list-item-subtitle
                            class="text--primary"
                            v-text="item.description"
                          ></v-list-item-subtitle>
                          <v-list-item-subtitle
                            v-text="`${item.tasks.length} Task(s)`"
                          ></v-list-item-subtitle>
                        </v-list-item-content>

                        <v-list-item-action>
                          <v-list-item-action-text
                            v-text="item.due_date"
                          ></v-list-item-action-text>

                          <v-btn
                            @click="manageTasks(item)"
                            text
                            color="primary"
                            class="mt-1"
                          >
                            Manage Tasks
                          </v-btn>
                          <!-- <v-icon v-if="!active" color="grey lighten-1">
                            star_border
                          </v-icon>

                          <v-icon v-else color="yellow">
                            star
                          </v-icon>-->
                        </v-list-item-action>
                      </template>
                    </v-list-item>

                    <v-divider :key="index"></v-divider>
                  </template>
                </v-list-item-group>
              </v-list>
            </div>
          </v-col>
          <v-col cols="4" class="offset-md-1">
            <h2>Create Event</h2>
            <v-form ref="form">
              <v-text-field
                v-model="eventForm.event_name"
                label="Event Name"
                required
              ></v-text-field>

              <v-text-field
                v-model="eventForm.description"
                label="Describe event"
                required
              ></v-text-field>

              <v-menu
                v-model="menu"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-model="eventForm.due_date"
                    label="Picker without buttons"
                    prepend-icon="event"
                    readonly
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="eventForm.due_date"
                  @input="menu = false"
                ></v-date-picker>
              </v-menu>

              <v-btn color="success" class="mr-4" @click="addEvent()">
                Add Event
              </v-btn>
            </v-form>
          </v-col>
        </v-row>
      </v-container>

      <v-dialog v-model="dialog" persistent max-width="600px">
        <v-card>
          <v-card-title>
            <span class="headline">Tasks</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-list>
                    <template v-for="(task, index) in eventInView.tasks">
                      <v-list-item :key="task.id">
                        <v-list-item-content>
                          <v-list-item-title
                            v-text="task.title"
                            :class="{ strike: task.done }"
                          ></v-list-item-title>
                        </v-list-item-content>

                        <v-list-item-avatar>
                          <v-checkbox v-model="task.done"></v-checkbox>
                        </v-list-item-avatar>
                      </v-list-item>
                      <v-divider :key="index"></v-divider>
                    </template>
                  </v-list>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="Enter Task Name"
                    required
                    v-model="newTask"
                  ></v-text-field>
                  <p>
                    <v-btn @click="addNewTask()">
                      Add Task
                    </v-btn>
                  </p>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="dialog = false"
              >Close</v-btn
            >
            <v-btn color="blue darken-1" text @click="dialog = false"
              >Save</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-content>
  </v-app>
</template>

<script>
/* eslint-disable no-console */
import db from "./db.js";
import { events_db } from "../firebase_auth.json";
export default {
  name: "App",

  components: {},

  data() {
    return {
      eventForm: {},
      menu: false,
      events: [
        {
          event_name: "Go hiking",
          description: "I want to go hiking cos everybody is doing it now",
          due_date: "2hrs",
          tasks: []
        }
      ],
      selectedEvent: [],
      dialog: false,
      eventInView: {},
      newTask: null,
      processing: false,
      user: this.$auth.user
    };
  },
  async created() {
    let profile = await this.$auth.checkSession();

    this.$bind(
      "events",
      db.collection(events_db).where("user", "==", profile.email || "")
    );
  },
  methods: {
    login() {
      this.$auth.login();
    },
    logout() {
      this.$auth.logout();
    },
    async addEvent() {
      if (
        this.eventForm.event_name &&
        this.eventForm.description &&
        this.eventForm.due_date
      ) {
        this.eventForm.tasks = [];
        this.eventForm.user = this.$auth.user.email;
        console.log(this.eventForm);

        this.processing = true;

        await db.collection(events_db).add(this.eventForm);

        this.processing = false;

        /* this.showModal(
          "Success",
          `Password Successfully added for Account: ${this.eventForm.account_name}`
        ); */

        //Clear form
        this.eventForm = {};
      } else {
        this.showModal("Error", `All fields are required`);
      }
    },
    manageTasks(event) {
      this.eventInView = event;

      this.dialog = true;
    },
    addNewTask() {
      let taskId;

      if (this.eventInView.tasks.length > 0) {
        taskId =
          this.eventInView.tasks[this.eventInView.tasks.length - 1].id + 1;
      } else {
        taskId = 1;
      }

      let newTask = {
        id: taskId,
        title: this.newTask,
        done: false
      };
      this.eventInView.tasks.push(newTask);
      this.newTask = null;
    }
  }
};
</script>
<style scoped>
.strike {
  text-decoration: line-through;
}
</style>
