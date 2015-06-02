#!/bin/sh
cd ${0%/*}
if (RUN_ONCE=1 meteor | tee /dev/tty | grep -q "All tests pass!")
then
  exit 0
else
  exit 1
fi

