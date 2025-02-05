'use client';

import { deleteAccount } from "@/app/auth/actions";

export default function DeleteAccount(props: { userId: string }) {
    return (
        <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300 ease-in-out" 
            onClick={() => deleteAccount(props.userId)}>
            Delete account
        </button>
    );
}