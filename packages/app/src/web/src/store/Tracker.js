import { observable, extendObservable, computed } from "mobx";
import moment from "moment";

export default class Tracker {
  constructor(id, name, nodeType) {
    extendObservable(this, {
      // Unique id of the tracker. This would be generated by the client
      id,

      // Type of the node. 0 = mobx node, 1 = mobx state tree node, 2 = plain old node
      nodeType,

      // Name of the tracker. Would be displayed in the dashboard. Provided by the client.
      name,

      // Last updated time
      updatedOn: moment(),

      // Actions we can invoke
      actions: [],

      // Recordings of the action
      recordings: [],

      // Actual current value of the observable
      value: {},

      logs: {
        // Logs generated by MST's onAction()
        actionLogs: [],

        // Logs generated by MST's onPatch()
        patches: [],

        // Snapshot generated by MST's onSnapshot()
        snapshots: []
      },

      // Selected action from the list of actions
      selectedActionIndex: 0,

      // Selected tab from the debug panel
      selectedTab: 0,

      // Get the arguments of the selection action. Arguments are set from the UI through the code editor
      actionArguments: computed(() => {
        if (this.actions[this.selectedActionIndex]) {
          return this.actions[this.selectedActionIndex].arguments;
        }

        return "";
      }),

      setName(name) {
        if (name) {
          this.name = name;
        }
      },

      // Sets the current selected tab
      setSelectedTab(index) {
        this.selectedTab = index;
      },

      // Sets the arguments of the current selected action
      setActionArguments(value) {
        if (this.actions.length === 0) {
          return;
        }

        this.actions[this.selectedActionIndex].arguments = value;
      },

      // Adds action to the actions array
      addActions(actions) {
        if (!actions) return;

        const observableActions = actions.map(action =>
          observable({
            name: action,
            arguments: "[]"
          })
        );
        this.actions.clear();
        this.actions.push(...observableActions);
      },

      // Update the updated time.
      setUpdatedTime(date) {
        this.updatedOn = date;
      },

      // Set the value of the tracker. The real value the observable holds in the app.
      setValue(value) {
        this.value = value;
      },

      // Add recoding
      addRecording(recordingId) {
        this.recordings.push(
          observable({
            name: "Un-named",
            recordingId
          })
        );
      },

      removeRecording(recodringId) {
        const itemToRemove = this.recordings.filter(
          recording => recording.recordingId === recodringId
        );
        this.recordings.remove(itemToRemove[0]);
      },

      renameRecording(recordingId, name) {
        const recordingToRename = this.recordings.find(
          item => item.recordingId === recordingId
        );

        recordingToRename.name = name;
      },

      addObserveLog(value, description) {
        this.value = value;
        this.addToTop(
          {
            displayNumber: this.logs.actionLogs.length + 1,
            time: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"),
            isExpanded: false,
            value: observable.ref(description)
          },
          this.logs.actionLogs
        );
      },

      addActionLog(value, actionMeta) {
        this.value = value;
        this.addToTop(
          {
            displayNumber: this.logs.actionLogs.length + 1,
            isExpanded: false,
            value: observable.ref(actionMeta)
          },
          this.logs.actionLogs
        );
      },

      addPatch(value, patch) {
        this.value = value;
        this.addToTop(
          {
            displayNumber: this.logs.patches.length + 1,
            isExpanded: false,
            value: observable.ref(patch)
          },
          this.logs.patches
        );
      },

      addSnapshot(value, snapshot) {
        this.value = value;
        this.addToTop(
          {
            displayNumber: this.logs.snapshots.length + 1,
            time: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"),
            isExpanded: false,
            value: observable.ref(snapshot)
          },
          this.logs.snapshots
        );
      },

      // Adds item to the top of the collection as an observable
      addToTop(item, collection) {
        if (item) {
          collection.unshift(observable(item));
        }
      },

      clearLogs() {
        this.logs.actionLogs.clear();
        this.logs.patches.clear();
        this.logs.snapshots.clear();
      }
    });
  }
}