import type { Participant } from "@pingxy/shared";

interface HydratedParticipant {
  participantId: number;
  conversationId: number;
  userId: number;
  role: "member" | "admin" | "moderator";
  joinedAt: string;
  leftAt: null;
  isActive: true;
  username: string;
  userType: "user" | "guest";
  data: {
    gender: string;
    age: number;
    country: string;
    roles: string[];
  };
}
export interface UIConversation extends Participant {
  type: "direct" | "group";
  displayName: string;
  lastMessageId: number;
  unreadCount: number;
  updatedAt: string;
  partner: {
    id: number;
    username: string;
    gender: string;
    age: number;
    country: string;
  };

  participants: HydratedParticipant[];
}

// {
//   "conversationId": 4,
//   "unreadCount": 0,
//   "type": "direct",
//   "displayName": "Kola",
//   "lastMessageId": null,
//   "updatedAt": "2026-02-10T15:58:14.934Z",
//   "partner": {
//     "userId": 4,
//     "username": "Kola",
//     "gender": "female",
//     "age": 18,
//     "country": "AF"
//   },
//   "participants": [
//     {
//       "participantId": 541,
//       "conversationId": 4,
//       "userId": 2,
//       "role": "member",
//       "joinedAt": "2026-02-10T15:58:14.945Z",
//       "leftAt": null,
//       "isActive": true,
//       "username": "Venom",
//       "userType": "user",
//       "data": {
//         "gender": "male",
//         "age": 18,
//         "country": "AF",
//         "roles": [
//           "user"
//         ]
//       }
//     },
//     {
//       "participantId": 542,
//       "conversationId": 4,
//       "userId": 4,
//       "role": "member",
//       "joinedAt": "2026-02-10T15:58:14.949Z",
//       "leftAt": null,
//       "isActive": true,
//       "username": "Kola",
//       "userType": "user",
//       "data": {
//         "gender": "female",
//         "age": 18,
//         "country": "AF",
//         "roles": [
//           "user"
//         ]
//       }
//     }
//   ]
// }
