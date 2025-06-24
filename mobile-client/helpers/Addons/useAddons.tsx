import React, { useState, useEffect } from "react";
import handleError from "../../helpers/ErrorHandler";
//This code gets the top 100 rankings AND the user ranking
import { useDatabase } from '@nozbe/watermelondb/react';
import {Addon} from "../../watermelon/models";
const useAddons = () => {
    const watermelonDatabase = useDatabase();
    const [addons, setAddons] = useState<Addon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError("")
            if(!watermelonDatabase){
                setError("Watermelon watermelonDatabase not found")
            }

            try {
		const addons = await watermelonDatabase.get('addons').query().fetch();

                if (!addons.length) {
                    setError("Error fetching addons.")
                    throw new Error("Error fetching addons.");
                }

                //console.log(addons)
                setAddons(addons);
            } catch (err: any) {
                setError(err.message);
                handleError(err, 'useAddons()');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [watermelonDatabase]);

    return { addons, loading, error };
};

export default useAddons;
