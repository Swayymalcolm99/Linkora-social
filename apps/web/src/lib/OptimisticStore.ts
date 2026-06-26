"use client";

import { useSyncExternalStore } from "react";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Types                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

export type FollowState = {
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Store internals                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

// Key format: `${followerAddress}:${followeeAddress}`
const followStateMap = new Map<string, FollowState>();
const followingMap = new Map<string, boolean>();
const pendingMap = new Map<string, boolean>();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Public API                                                               */
/* ────────────────────────────────────────────────────────────────────────── */

export const OptimisticStore = {
  subscribe,

  setFollowState(key: string, state: FollowState) {
    followStateMap.set(key, state);
    notify();
  },

  getFollowState(key: string): FollowState | undefined {
    return followStateMap.get(key);
  },

  clearFollowState(key: string) {
    followStateMap.delete(key);
    notify();
  },

  isFollowing(address: string): boolean {
    return followingMap.get(address) ?? false;
  },

  setFollowing(address: string, value: boolean) {
    followingMap.set(address, value);
    notify();
  },

  isPending(address: string): boolean {
    return pendingMap.get(address) ?? false;
  },

  setPending(address: string, value: boolean) {
    pendingMap.set(address, value);
    notify();
  },
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Hook                                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Returns the optimistic follow state if one exists, otherwise falls back
 * to `initialState` (the "truth" from the server/contract).
 *
 * @param follower  Current user's address (null when not connected)
 * @param followee  Target profile's address
 * @param initialState  Server-sourced truth state
 */
export function useOptimisticFollow(
  follower: string | null,
  followee: string,
  initialState: FollowState
): FollowState {
  const key = `${follower}:${followee}`;

  const optimistic = useSyncExternalStore(
    subscribe,
    // Client snapshot
    () => (follower ? OptimisticStore.getFollowState(key) : undefined),
    // Server snapshot — always undefined (no optimistic state on SSR)
    () => undefined
  );

  return optimistic ?? initialState;
}
