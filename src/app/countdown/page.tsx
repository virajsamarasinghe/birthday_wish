'use client';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Countdown from 'react-countdown';
import useSound from 'use-sound';

export default function CountdownPage() {
  const [showWish, setShowWish] = useState(false);
  const [showBirthdayMessage, setShowBirthdayMessage] = useState(false);
  const [showImageSection, setShowImageSection] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [play, { stop, sound }] = useSound('/music/happy-birthday-357371.mp3', {
    volume: 0.5,
    preload: true
  });
  const [startDate, setStartDate] = useState<number>(0);
  
  useEffect(() => {
    setMounted(true);
    // Set the start date only on the client side
    setStartDate(Date.now() + 10000); // 10 seconds from now
  }, []);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Fallback HTML5 audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!mounted) return;

    // Create HTML5 audio element as fallback
    audioRef.current = new Audio('/music/happy-birthday-357371.mp3');
    audioRef.current.volume = 0.5;
    audioRef.current.preload = 'auto';
    
    audioRef.current.addEventListener('error', (e: Event) => {
      setAudioError('Failed to load audio file');
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('canplaythrough', () => {});
        audioRef.current.removeEventListener('error', () => {});
      }
    };
  }, [mounted]);

  // Handle manual audio play on user interaction
  const handleUserInteraction = async () => {
    if (!audioPlayed && showWish) {
      setAudioError(null);
      
      // Try use-sound first
      try {
        play();
        setAudioPlayed(true);
        return;
      } catch (error) {
        // Fallback to HTML5 audio
      }
      
      // Fallback to HTML5 audio
      if (audioRef.current) {
        try {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
            setAudioPlayed(true);
          }
        } catch (error) {
          setAudioError('Unable to play audio. Please check your browser settings.');
        }
      }
    }
  };

  const images = useMemo(() => [
    '/images/photo1.webp',
    '/images/photo2.webp',
    '/images/photo3.webp',
    '/images/photo4.webp',
    '/images/photo5.webp',
    '/images/photo6.webp',
    '/images/photo7.webp',
    '/images/photo8.webp',
    '/images/photo9.webp'
  ], []);

  // Preload images
  const preloadImages = useCallback(async () => {
    if (!mounted) return;
    
    try {
      const imagePromises = images.map((src, index) => {
        return new Promise<void>((resolve, reject) => {
          const img = document.createElement('img');
          img.src = src;
          img.onload = () => {
            resolve();
          };
          img.onerror = (error) => {
            setImageErrors(prev => new Set([...prev, src]));
            resolve(); // Don't reject, just mark as error and continue
          };
        });
      });
      
      const results = await Promise.allSettled(imagePromises);
      setImagesLoaded(true);
    } catch (error) {
      // Still mark as loaded to show images even if preloading failed
      setImagesLoaded(true);
    }
  }, [images, mounted]);

  useEffect(() => {
    preloadImages();
  }, [preloadImages]);
  
  // Auto-advance slideshow when images are loaded and wish is shown
  useEffect(() => {
    if (!imagesLoaded || !showWish) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change image every 4 seconds
    
    return () => clearInterval(interval);
  }, [imagesLoaded, showWish, images.length]);
  
  const onComplete = () => {
    // First show full-page birthday message
    setShowBirthdayMessage(true);
    
    // After 3 seconds, play song and start transition to images
    setTimeout(() => {
      // Try to play the birthday song
      try {
        play();
        setAudioPlayed(true);
      } catch (error) {
        // Fallback to HTML5 audio
        if (audioRef.current) {
          audioRef.current.play().catch(e => {
            setAudioError('Click to play the birthday song!');
          });
        }
      }
      
      // After 2 more seconds, show wish section and smoothly transition to images
      setTimeout(() => {
        setShowWish(true);
        setShowImageSection(true);
        
        // Auto scroll to photo section after images load
        setTimeout(() => {
          const photoSection = document.getElementById('photo-section');
          if (photoSection) {
            photoSection.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 1500);
      }, 2000);
    }, 3000);
  };

  const renderer = ({ seconds, completed }: { seconds: number, completed: boolean }) => {
    if (completed) {
      return null;
    }

    return (
      <motion.div 
        className="text-center relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: 1
        }}
        transition={{
          scale: {
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          },
          opacity: {
            duration: 0.5,
            ease: "easeOut"
          }
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-md rounded-full p-12 md:p-16 
        shadow-2xl border border-white/50 relative group hover:scale-105 transition-transform duration-300">
          <motion.div 
            className="text-7xl md:text-9xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent
            relative z-10 group-hover:from-rose-600 group-hover:to-pink-700 transition-all duration-300"
            initial={{ scale: 1 }}
            animate={{ scale: seconds === 1 ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.5 }}
          >
            {seconds}
          </motion.div>
          <div className="text-2xl font-medium mt-4 bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
            Seconds
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">✨</div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 text-2xl">✨</div>
          <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">💖</div>
          <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 text-2xl">💖</div>
        </div>
      </motion.div>
    );
  };

  const BackgroundAnimation = () => {
    if (!mounted) return null;
    
    const emojis = ["❤️", "✨", "💝", "💖"];
    const positions = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: (i % 5) * 20 - 50,
      y: Math.floor(i / 5) * 20 - 50,
      left: `${(i * 3.33) % 100}%`,
      top: `${(i * 7.5) % 100}%`,
      emoji: emojis[i % emojis.length],
    }));

    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {positions.map(({ id, x, y, left, top, emoji }) => (
          <motion.div
            key={id}
            className="absolute text-pink-300/10 text-6xl"
            initial={{ 
              x,
              y,
              scale: 0.75,
              opacity: 0,
              rotate: id * 30
            }}
            animate={{ 
              y: [-30, 30],
              x: [-15, 15],
              opacity: [0.1, 0.3, 0.1],
              rotate: [0, 360],
              scale: [0.8, 1, 0.8]
            }}
            transition={{ 
              repeat: Infinity,
              duration: 4 + id % 5,
              ease: "easeInOut",
              times: [0, 0.5, 1],
              delay: id * 0.1
            }}
            style={{ left, top }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>
    );
  };

  if (!mounted) {
    return null;
  }

  return (
    <main 
      className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-200 to-purple-100 relative overflow-hidden"
      onClick={handleUserInteraction}
    >
      <BackgroundAnimation />
      
      {/* Full-page Happy Birthday Message */}
      {showBirthdayMessage && !showWish && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-pink-500 via-red-400 to-yellow-400"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 1.5, type: "spring", stiffness: 100, damping: 15 }}
        >
          <div className="text-center">
            <motion.div
              className="mb-8"
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1, type: "spring" }}
            >
              <div className="text-9xl md:text-[12rem] lg:text-[15rem] mb-4">
                🎉
              </div>
            </motion.div>
            
            <motion.h1
              className="text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-8 drop-shadow-2xl"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1, duration: 1.2, type: "spring", stiffness: 80 }}
            >
              HAPPY
            </motion.h1>
            
            <motion.h1
              className="text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-8 drop-shadow-2xl"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.3, duration: 1.2, type: "spring", stiffness: 80 }}
            >
              BIRTHDAY
            </motion.h1>
            
            <motion.div
              className="text-8xl md:text-9xl"
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 2, duration: 1.5, type: "spring" }}
            >
              🎂✨🎈
            </motion.div>
            
            <motion.p
              className="text-2xl md:text-3xl text-white/90 mt-8 font-light"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5, duration: 1 }}
            >
              Get ready for something special...
            </motion.p>
          </div>
        </motion.div>
      )}
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Countdown Section - only show when birthday message is not active */}
        {!showBirthdayMessage && (
        <section className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.8, 
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            className="text-center p-12 backdrop-blur-md bg-white/40 rounded-3xl shadow-2xl
            border border-white/50 max-w-2xl mx-4"
          >
              <motion.div 
                className="relative inline-block mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.h2 
                  className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 
                  bg-clip-text text-transparent relative"
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  transition={{ 
                    duration: 0.5,
                    type: "spring",
                    stiffness: 200
                  }}
                >
                  <motion.span 
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-2xl"
                    animate={{ y: [-4, 4] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      repeatType: "reverse" 
                    }}
                  >
                    ✨
                  </motion.span>
                  Counting Down to Your Special Day
                  <motion.span 
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-2xl"
                    animate={{ y: [-4, 4] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      repeatType: "reverse", 
                      delay: 0.75 
                    }}
                  >
                    ✨
                  </motion.span>
                </motion.h2>
              </motion.div>
              {startDate > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Countdown
                    date={startDate}
                    renderer={renderer}
                    onComplete={onComplete}
                  />
                </motion.div>
              )}
            </motion.div>
        </section>
        )}

        {showWish && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="min-h-screen flex flex-col items-center justify-center relative"
          >
            {/* Confetti effect */}
            {[...Array(50)].map((_, i) => {
              // Use deterministic values based on index
              const left = `${(i * 2) % 100}%`;
              const width = `${5 + (i % 10)}px`;
              const height = width;
              const color = ['#FF69B4', '#FFB6C1', '#FFC0CB', '#FF1493'][i % 4];
              const delay = (i % 10) * 0.3;
              
              return (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ 
                    top: -20,
                    left,
                    width,
                    height,
                    backgroundColor: color,
                    borderRadius: '50%',
                    opacity: 1
                  }}
                  animate={{
                    top: '100vh',
                    rotate: 360,
                    opacity: 0
                  }}
                  transition={{
                    duration: 2 + (i % 2),
                    repeat: Infinity,
                    delay
                  }}
                />
              );
            })}
            
            <motion.div 
              className="text-center mb-12 relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 1 }}
            >
              <motion.h1 
                className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-rose-500 to-pink-500
                bg-clip-text text-transparent mb-8 relative inline-block"
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <span className="absolute -top-8 -left-8 text-4xl animate-bounce">🎉</span>
                Happy Birthday!
                <span className="absolute -top-8 -right-8 text-4xl animate-bounce delay-100">�</span>
              </motion.h1>
              <motion.p 
                className="text-xl md:text-2xl text-gray-700 relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <span className="absolute -left-6 top-1/2 transform -translate-y-1/2 text-2xl animate-pulse">💖</span>
                Wishing you all the love and happiness in the world
                <span className="absolute -right-6 top-1/2 transform -translate-y-1/2 text-2xl animate-pulse delay-100">💖</span>
              </motion.p>
              
              {/* Audio play indicator with button */}
              {!audioPlayed && (
                <motion.div
                  className="mt-6 p-4 bg-pink-100/80 rounded-lg border border-pink-200"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                >
                  <p className="text-pink-700 text-sm flex items-center justify-center gap-2 mb-3">
                    <span className="text-xl">🎵</span>
                    Click to play the birthday song!
                    <span className="text-xl">🎵</span>
                  </p>
                  <button
                    onClick={handleUserInteraction}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-full 
                             transition-colors duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                   
                  </button>
                </motion.div>
              )}
              
              {audioPlayed && (
                <motion.div
                  className="mt-6 p-4 bg-green-100/80 rounded-lg border border-green-200"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                 
                </motion.div>
              )}
              
              {/* Audio error display */}
              {audioError && (
                <motion.div
                  className="mt-4 p-3 bg-red-100/80 rounded-lg border border-red-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-red-700 text-sm text-center">
                    ⚠️ {audioError}
                  </p>
                </motion.div>
              )}
            </motion.div>
            
            <motion.div
              id="photo-section"
              initial={{ scale: 0.8, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ delay: 1, duration: 1.5, type: "spring" }}
              className="space-y-12"
            >
              {/* Image loading status */}
              {!imagesLoaded && (
                <motion.div
                  className="text-center p-6 bg-pink-100/80 rounded-lg border border-pink-200 mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-pink-700 flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Loading your special memories...
                    <span className="animate-pulse">💖</span>
                  </p>
                </motion.div>
              )}
              
              {/* Single Image Slideshow Display */}
              {imagesLoaded && (
                <motion.div
                  key={currentImageIndex}
                  className="w-full max-w-6xl mx-auto mb-16 p-6"
                  initial={{ opacity: 0, x: 300, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -300, scale: 0.8 }}
                  transition={{ 
                    duration: 1,
                    type: "spring",
                    stiffness: 100,
                    damping: 20
                  }}
                >
                  <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-8 border-white/90"
                    style={{ maxHeight: '70vh' }}>
                    {imageErrors.has(images[currentImageIndex]) ? (
                      <div className="w-full h-[600px] flex items-center justify-center bg-gradient-to-r from-pink-400 to-pink-500 text-white text-center">
                        <div className="p-8">
                          <div className="text-6xl mb-4">📷</div>
                          <p className="text-xl font-semibold mb-2">Photo {currentImageIndex + 1}</p>
                          <p className="text-sm opacity-90 mb-4">Special Memory</p>
                          <p className="text-xs opacity-70">Image: {images[currentImageIndex].split('/').pop()}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <motion.img
                          key={`img-${currentImageIndex}`}
                          src={images[currentImageIndex]}
                          alt={`Our Journey Photo ${currentImageIndex + 1}`}
                          className="w-full h-auto max-h-[70vh] object-contain transition-transform duration-700 hover:scale-105"
                          style={{
                            maxWidth: '100%',
                            objectFit: 'contain',
                            objectPosition: 'center',
                          }}
                          initial={{ opacity: 0, scale: 1.1 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.8 }}
                          loading="eager"
                          onError={(e) => {
                            setImageErrors(prev => new Set([...prev, images[currentImageIndex]]));
                          }}
                          onLoad={() => {
                            // Image loaded successfully
                          }}
                        />
                      </>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10"></div>
                    
                    {/* Story Navigation */}
                    <div className="absolute top-4 right-4 z-30 flex gap-2">
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                        className="bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition-all"
                        title="Previous photo"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                        className="bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition-all"
                        title="Next photo"
                      >
                        →
                      </button>
                    </div>
                    
                    {/* Story Progress Dots */}
                    <div className="absolute top-4 left-4 z-30 flex gap-1">
                      {images.map((_, index) => (
                        <motion.button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all ${
                            index === currentImageIndex 
                              ? 'bg-white scale-125' 
                              : 'bg-white/50 hover:bg-white/70'
                          }`}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        />
                      ))}
                    </div>
                    
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 p-6 text-white text-center z-20
                        bg-gradient-to-t from-black/60 to-transparent"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <motion.h3 
                        key={`title-${currentImageIndex}`}
                        className="text-3xl font-bold mb-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        Our Story ❤️
                      </motion.h3>
                      <motion.p 
                        key={`counter-${currentImageIndex}`}
                        className="text-white/90 text-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        Chapter {currentImageIndex + 1} of {images.length}
                      </motion.p>
                      <motion.div
                        className="mt-3 w-full bg-white/20 rounded-full h-2"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                      >
                        <motion.div
                          className="bg-pink-400 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${((currentImageIndex + 1) / images.length) * 100}%` }}
                          transition={{ delay: 0.8, duration: 0.5 }}
                        />
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.section>
        )}
      </div>
    </main>
  );
}