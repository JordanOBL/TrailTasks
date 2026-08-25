import EnhancedParkDetails from "../components/Parks/ParkDetails";
import React from "react";
import { useDatabase } from "@nozbe/watermelondb/react";
import { Park, User, Wild } from "../watermelon/models";
import { Model } from "@nozbe/watermelondb";
export default function ParkDetailsScreen({
  user,
  route,
}: {
  user: User;
  route: { params: { parkId: string; wild: Wild } };
}) {
  const db = useDatabase();
  const { parkId, wild } = route.params;

  // Fetch the Watermelon model instance
  const [park, setPark] = React.useState<Park | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      const p: Park = await db.get<Park>("parks").find(parkId);
      if (isMounted) setPark(p);
    })();
    return () => {
      isMounted = false;
    };
  }, [db, parkId]);

  if (!park) return null;

  // Pass the real model to the enhanced component
  return <EnhancedParkDetails park={park} wild={wild} user={user} />;
}
