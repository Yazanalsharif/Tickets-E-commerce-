const axios = require("axios");

let user =
  "session=eyJ0b2tlbiI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpwWkNJNklqWTJNemhtTjJVeU16YzFOek0yTjJJd09EazJPRFF4TXlJc0ltVnRZV2xzSWpvaWVXRjZZVE51TVRNeU16RXpNVE5BWjIxaGFXd3VZMjl0SWl3aWFXRjBJam94TnpFMU1EQTVOVEEyZlEuSmpqOHo5QkpLWXF6M0hoZWZxbzRXZWx6RV8wWHlja3M1RGRJY3pTUHBoVSJ9";
const createTicketTestSimuntaslan = async () => {
  // Create the ticket
  let reqs = [];
  let reses = [];
  for (let i = 0; i < 100; i++) {
    // Create the ticket

    let res = await axios.post(
      "http://ticketing.dev/api/tickets/",
      { title: "Ticket Test", price: 5 },
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: [user],
        },
      }
    );

    reqs.push(
      axios.put(
        `http://ticketing.dev/api/tickets/${res.data.ticket.id}`,
        {
          price: 10,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Cookie: [user],
          },
        }
      )
    );

    reqs.push(
      axios.put(
        `http://ticketing.dev/api/tickets/${res.data.ticket.id}`,
        {
          price: 15,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Cookie: [user],
          },
        }
      )
    );
  }

  reses = await Promise.allSettled(reqs);
};

const createTicketTest = async () => {
  // Create the ticket
  let reqs = [];
  let reses = [];
  for (let i = 0; i < 100; i++) {
    let requests = [];
    // Create the ticket

    let res = await axios.post(
      "http://ticketing.dev/api/tickets/",
      { title: "Ticket Test", price: 5 },
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: [user],
        },
      }
    );

    await axios.put(
      `http://ticketing.dev/api/tickets/${res.data.ticket.id}`,
      {
        price: 10,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: [user],
        },
      }
    );

    await axios.put(
      `http://ticketing.dev/api/tickets/${res.data.ticket.id}`,
      {
        price: 15,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: [user],
        },
      }
    );

    // Make it 200 time
  }
};
// createTicketTest();
createTicketTest();
// createTicketTest();
// requests.push(
//   axios.put(
//     `http://ticketing.dev/api/tickets/${res.data.ticket.id}`,
//     {
//       price: 10,
//     },
//     {
//       headers: {
//         "Content-Type": "application/json",
//         Cookie: [user],
//       },
//     }
//   )
// );

// requests.push(
//   axios.put(
//     `http://ticketing.dev/api/tickets/${res.data.ticket.id}`,
//     {
//       price: 15,
//     },
//     {
//       headers: {
//         "Content-Type": "application/json",
//         Cookie: [user],
//       },
//     }
//   )
// );
// let response = await Promise.allSettled(requests);
// responses.concat(response);
