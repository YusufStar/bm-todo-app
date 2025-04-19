"use client";

import { useUser } from "@/hooks";
import { cn, Spinner } from "@heroui/react";
import { useEffect, useState, useRef } from "react";
import { Logo } from "../icons";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
// Helper function to generate deterministic values based on a seed
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const Particles = ({ count = 20 }: { count?: number }) => {
  return (
    <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        // Use the index (key) as a seed for deterministic randomness
        const baseSeed = i;

        // Generate deterministic values using the seed
        const size = seededRandom(baseSeed * 1.1) * 4 + 1;
        const duration = seededRandom(baseSeed * 1.2) * 8 + 6;
        const delay = seededRandom(baseSeed * 1.3) * 2;
        const opacity = seededRandom(baseSeed * 1.4) * 0.5 + 0.3;
        const topPosition = seededRandom(baseSeed * 1.5) * 100;
        const leftPosition = seededRandom(baseSeed * 1.6) * 100;
        const xOffset = (seededRandom(baseSeed * 1.7) - 0.5) * 100;
        const yOffset = -150 - seededRandom(baseSeed * 1.8) * 50;
        const maxScale = seededRandom(baseSeed * 1.9) * 0.5 + 1;

        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-foreground/30 z-10"
            style={{
              width: size,
              height: size,
              top: `${topPosition}%`,
              left: `${leftPosition}%`,
              opacity: 0,
            }}
            animate={{
              y: [0, yOffset],
              x: [0, xOffset],
              opacity: [0, opacity, 0],
              scale: [1, maxScale, 0],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              repeatDelay: 0.5,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
};

export default function LoadingText() {
  const text = "Getting / user / informations...";
  const chars = text.split("");

  const charVariant = (index: number) => ({
    initial: { opacity: 1 },
    animate: {
      opacity: [1, 0.7, 1],
      transition: {
        delay: index * 0.1,
        duration: 1.6,
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 0.2,
        repeatType: "loop" as const,
      },
    },
  });

  return (
    <div className="flex items-center">
      {chars.map((char, index) => (
        <motion.span
          key={index}
          variants={charVariant(index)}
          animate="animate"
          className={cn(
            "text-foreground/70 font-medium tracking-wide relative z-10",
            char === "/" ? "mx-0.5" : ""
          )}
        >
          {char === "/" ? " " : char}
        </motion.span>
      ))}
    </div>
  );
}

export const AuthProvider = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) => {
  const { refetch, user: userFromHook } = useUser();
  const pathname = usePathname();
  const [showLoading, setShowLoading] = useState(false);
  const initialFetchRef = useRef(true);
  const loadingStartTimeRef = useRef<number>(Date.now());
  
  // Set initial loading state based on NextAuth user
  useEffect(() => {
    // Only show loading screen if NextAuth user exists
    if (user) {
      setShowLoading(true);
      loadingStartTimeRef.current = Date.now();
    } else {
      // If no NextAuth user, never show loading screen
      setShowLoading(false);
      initialFetchRef.current = false; // No need to fetch
    }
  }, [user]);
  
  // Handle initial data fetch
  useEffect(() => {
    // Only proceed if NextAuth user exists
    if (user && showLoading) {
      // Perform the initial fetch only once
      if (initialFetchRef.current) {
        refetch().then(() => {
          // Mark initial fetch as completed
          initialFetchRef.current = false;
        });
      }
    }
  }, [user, refetch, showLoading]);

  // Separate effect for handling the minimum loading time
  useEffect(() => {
    // If we have the database user and completed initial fetch
    if (userFromHook && !initialFetchRef.current && showLoading) {
      const currentTime = Date.now();
      const elapsedTime = currentTime - loadingStartTimeRef.current;
      const minLoadingTime = 2500; // 2.5 seconds minimum
      
      if (elapsedTime >= minLoadingTime) {
        // If minimum time has already passed, hide loading immediately
        setShowLoading(false);
      } else {
        // Otherwise, wait for the remaining time
        const remainingTime = minLoadingTime - elapsedTime;
        const timer = setTimeout(() => {
          setShowLoading(false);
        }, remainingTime);
        
        return () => clearTimeout(timer);
      }
    }
  }, [userFromHook, showLoading]);
  
  // Handle path changes - only refetch data, don't show loading screen
  useEffect(() => {
    if (!initialFetchRef.current && user) {
      refetch();
    }
  }, [pathname, refetch, user]);

  return (
    <AnimatePresence mode="wait">
      {showLoading ? (
        <motion.div
        className="flex justify-center items-center h-screen gap-2 flex-col bg-gradient-to-b from-background to-foreground-300/10 relative"
        initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          key="loading"
        >
          <Particles count={30} />

          <div className="relative z-10">
            <Logo className="w-12 h-12" />
          </div>

          <LoadingText />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          key="content"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
