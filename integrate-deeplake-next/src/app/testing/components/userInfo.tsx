"use client";

import { useEffect, useState } from "react";
import { getInformation, InformationInterface } from "../action";

export default function UserInformationList() {
    const [users, setUsers] = useState<InformationInterface[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getInformation();
            setUsers(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) return <p>Loading...</p>;

    console.log("data user",users)

    return (
        <div className="p-4">
            <h2 className="text-lg font-bold mb-4">User Information</h2>
            <ul className="bg-white shadow-md rounded p-4">
                {users.length > 0 ? (
                    users.map((user) => (
                        <li key={user.id} className="border-b py-2">
                            <strong>{user.nama}</strong> - {user.alamat}
                        </li>
                    ))
                ) : (
                    <p>No data available.</p>
                )}
            </ul>
        </div>
    );
}
