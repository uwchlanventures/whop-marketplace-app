"use client";

import React, { useEffect, useState } from "react";
import type { AccessLevel } from "@whop/api";
import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

interface Marketplace {
  id: string;
  title: string;
  takeRate: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ExperienceHome({
  accessLevel,
  experienceId,
}: {
  accessLevel: AccessLevel;
  experienceId: string;
}) {
  const [marketplaces, setMarketplaces] = useState<Marketplace[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/experiences/${experienceId}/marketplaces`)
      .then(async (res) => {
        console.log(res);
        if (!res.ok) throw new Error("Failed to fetch marketplaces");
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setMarketplaces(data.marketplaces || []);
        setError(null);
      })
      .catch((err) => {
			console.log(err);
	     setError(err.message || "Unknown error");
        setMarketplaces([]);
      })
      .finally(() => setLoading(false));
  }, [experienceId]);

  return (
    <div>
      <div className="flex justify-center items-center">
        <div className="text-4xl font-bold text-center">
          Marketplaces for this experience
        </div>
      </div>
      {accessLevel === "admin" && (
        <div className="flex justify-center items-center">
          <Link href={`/experiences/${experienceId}/marketplace/create`}>
            <Button>Create a marketplace</Button>
          </Link>
        </div>
      )}
      <div className="mt-6">
        {loading && <div>Loading marketplaces...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && marketplaces && marketplaces.length === 0 && (
			<div>
				<div className="text-gray-500 text-center">
					No marketplaces found for this experience.
				</div>
				<div className="text-center">
            {accessLevel === 'admin' ? (
              <p className="text-gray-600 mb-2">
                Click 'Create a marketplace' above to create the first marketplace in this whop.
              </p>
            ) : accessLevel === 'customer' ? (
              <p className="text-gray-600 mb-2">
                No marketplaces are available at the moment. Please check back later.
              </p>
            ) : (
              <p className="text-gray-600">
                You don't have access to view this content.
              </p>
            )}
				</div>
			</div>
        )}
        {!loading && !error && marketplaces && marketplaces.length > 0 && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {marketplaces.map((marketplace) => (
              <Link 
                key={marketplace.id} 
                href={`/experiences/${experienceId}/marketplace/${marketplace.id}`}
                className="group block"
              >
                <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 hover:border-blue-500 transition-colors duration-200 h-full flex flex-col">
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {marketplace.title}
                      </h3>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Take Rate: {marketplace.takeRate}%
                    </p>
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {marketplace.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-3 text-sm text-gray-500">
                    Created on {new Date(marketplace.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}