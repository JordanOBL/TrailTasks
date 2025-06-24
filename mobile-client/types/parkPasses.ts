import { User_Park, Trail } from '../watermelon/models';
export type CombinedData = {
  parkId: string;
  parkName: string;
  parkImageUrl: string;
  totalTrails: number;
  completedTrails: number;
  trails: Trail[]; // Include trail details if needed by the child
  pass: User_Park;
}
