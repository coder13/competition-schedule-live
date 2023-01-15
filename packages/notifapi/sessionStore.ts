// import { Store } from 'express-session';
// import { PrismaClient } from './prisma/generated/client';

// class PrismaSessionStore extends Store {
//   prisma: PrismaClient;
//   constructor({ client, ...options }: { client: PrismaClient }) {
//     super(options);
//     this.prisma = client;
//   }

//   get(sid, cb) {
//     this.prisma.session
//       .findUnique({
//         where: { sid },
//       })
//       .then((session) => {
//         cb(null, session?.data ?? null);
//       })
//       .catch((err) => {
//         cb(err);
//       });
//   }

//   set() {
//     throw new Error('Method not implemented.');
//   }

//   destroy() {
//     throw new Error('Method not implemented.');
//   }

//   all() {
//     throw new Error('Method not implemented.');
//   }

//   clear() {
//     throw new Error('Method not implemented.');
//   }

//   length() {
//     throw new Error('Method not implemented.');
//   }

//   touch() {
//     throw new Error('Method not implemented.');
//   }
// }

// export default PrismaSessionStore;
