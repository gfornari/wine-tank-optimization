#!/bin/bash

mkdir -p instances

num_tanks=5
max_amount=10
timelimit=10000

for i in `seq 1 1 60`; do
  echo "Running $i"
  python instance-generator.py $num_tanks 80 100 $i 5 $max_amount instances
  size=$(bc <<< "$max_amount^($num_tanks*$i)")
  exceeded=$(python ../solver/solver.py instances/data-$num_tanks-80-100-$i-5-$max_amount.json $timelimit | grep -c "Time limit exceeded")
  echo -e "Problem: $num_tanks 80 100 $i 5 $max_amount
Problem size: $size
Exceeded: $exceeded"
  if [ $exceeded == 1 ]; then
    exit 0
  fi
done