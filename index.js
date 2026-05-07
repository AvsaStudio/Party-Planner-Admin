// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2506-SALOME"; // Add your cohort here if needed
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();

    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Creates a new party */
async function addParty(newParty) {
  try {
    const response = await fetch(API + "/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newParty),
    });

    const result = await response.json();
    console.log(result);

    await getParties();
  } catch (e) {
    console.error(e);
  }
}

/** Deletes a party */
async function removeParty(id) {
  try {
    const response = await fetch(API + "/events/" + id, {
      method: "DELETE",
    });

    console.log(response);

    selectedParty = null;
    await getParties();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();

    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();

    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();

    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

// === Components ===

function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;

  $li.addEventListener("click", () => getParty(party.id));

  return $li;
}

function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");

  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <button>Delete party</button>
    <GuestList></GuestList>
  `;

  $party.querySelector("GuestList").replaceWith(GuestList());

  const $button = $party.querySelector("button");
  $button.addEventListener("click", () => {
    removeParty(selectedParty.id);
  });

  return $party;
}

function GuestList() {
  const $ul = document.createElement("ul");

  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });

  $ul.replaceChildren(...$guests);

  return $ul;
}

function NewPartyForm() {
  const $form = document.createElement("form");

  $form.innerHTML = `
    <h2>Add a new party</h2>

    <label>
      Name
      <input name="name" required />
    </label>

    <label>
      Description
      <input name="description" required />
    </label>

    <label>
      Date
      <input name="date" type="date" required />
    </label>

    <label>
      Location
      <input name="location" required />
    </label>

    <button>Add party</button>
  `;

  $form.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData($form);

    const newParty = {
      name: formData.get("name"),
      description: formData.get("description"),
      date: new Date(formData.get("date")).toISOString(),
      location: formData.get("location"),
    };

    addParty(newParty);
    $form.reset();
  });

  return $form;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");

  $app.innerHTML = `
    <h1>Party Planner Admin</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
        <NewPartyForm></NewPartyForm>
      </section>

      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
    </main>
  `;

  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("NewPartyForm").replaceWith(NewPartyForm());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
}

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
}

init();
