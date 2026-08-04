            <Link 
              href="/create-playlist"
              onClick={() => {
                if (selectedTrackForMenu) {
                   localStorage.setItem('pending_tremlist_track', JSON.stringify(selectedTrackForMenu));
                }
                setSelectedTrackForMenu(null);
              }}
              className="flex items-center px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
            >
              Create a Tremlist
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default NowPlaying;
