require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token; // eslint-disable-line

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });

    test('returns all albums', async () => {

      const expectation = [
        {
          "id": 1,
          "name": "Sun Ra: Space Is The Place",
          "description": "an excellent introduction to Sun Ras vast and free-form jazz catalog",
          "category": "jazz",
          "price": 20,
          "instock": true,
          "owner_id": 1
        },
        { "id": 2, "name": "Os Mutantes: s/t", "description": "the debut eponymous album by the Brazilian tropicalia band Os Mutantes", "category": "tropicalia", "price": 18, "instock": true, "owner_id": 1 }, { "id": 3, "name": "Kate Bush: Hounds Of Love", "description": "the fifth studio album by English singer-songwriter and musician Kate Bush", "category": "art pop", "price": 22, "instock": true, "owner_id": 1 }, { "id": 4, "name": "Beach Boys: Pet Sounds", "description": "Maybe the best record ever recorded?", "category": "pop", "price": 21, "instock": false, "owner_id": 1 }, { "id": 5, "name": "Sam Cooke: Live At The Harlem Square Club", "description": "the second live album by the American singer-songwriter Sam Cooke", "category": "soul", "price": 24, "instock": true, "owner_id": 1 }, { "id": 6, "name": "Duster: Stratosphere", "description": "the debut studio album by American space-rock band Duster", "category": "slowcore", "price": 23, "instock": false, "owner_id": 1 }, { "id": 7, "name": "WITCH: Lazy Bones", "description": "One of the defining albums from the zam-rock movement", "category": "zam-rock", "price": 21, "instock": true, "owner_id": 1 }, { "id": 8, "name": "The Cure: The Head On The Door", "description": "the first glimpse of the Cure as a pop band", "category": "new-wave", "price": 18, "instock": true, "owner_id": 1 }
      ];

      const data = await fakeRequest(app)
        .get('/albums')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
    test('returns a single item with matchin id', async () => {

      const expectation =
      {
        "id": 1,
        "name": "Sun Ra: Space Is The Place",
        "description": "an excellent introduction to Sun Ras vast and free-form jazz catalog",
        "category": "jazz",
        "price": 20,
        "instock": true,
        "owner_id": 1
      };



      const data = await fakeRequest(app)
        .get('/albums/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
