import EnhancedParkDetails from '../components/Parks/ParkDetails'
import React from "react";
import { useDatabase } from "@nozbe/watermelondb/react";
export default function ParkDetailsScreen({ user, route }) {
  const db = useDatabase();
  const { parkId, wild } = route.params; 
 
  // Fetch the Watermelon model instance
  const [park, setPark] = React.useState(null);

  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      const p = await db.get("parks").find(parkId);
      if (isMounted) setPark(p);
    })();
    return () => { isMounted = false; };
  }, [db, parkId]);

  if (!park) return null;

  // Pass the real model to the enhanced component
  return <EnhancedParkDetails park={park} wild={wild} user={user} />;
}
