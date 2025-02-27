"use server"

import { createClient } from "@/utils/supabase/server"

export interface InformationInterface {
    id: number
    nama: string;
    alamat: string;
}

export const getInformation = async (): Promise<InformationInterface[]> => {
    const supabase = await createClient(); // Tambahkan 'await' di sini

    const { data, error } = await supabase
        .from("user_information")
        .select('*'); // Mengambil semua kolom

    if (error) {
        console.error("Error fetching data:", error);
        return [];
    }

    return data || [];
};
