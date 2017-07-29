//constants
export const Triggers = {
ADDED                 : "added",
ADDED_TO_STAGE         : "addedToStage",
ENTER_FRAME             : "enterFrame",
REMOVED             : "removed",
REMOVED_FROM_STAGE    : "removedFromStage"
}

class Event {
	constructor(type, bubbles, cancelable = true) {
		this.type = type;
    this.cancelable = cancelable;
    this.bubbles = bubbles;
    this.data = null;
    this.target = null;
    this.currentTarget = null;
	}

  stopPropagation() {
    if(this.cancelable) {
      this.bubbles = false;
    }
  }

};
export default Event;

//Tomahawk.registerClass( Event, "Event" );