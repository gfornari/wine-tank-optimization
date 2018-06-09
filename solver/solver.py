#
# IMPORT THE OR-TOOLS CONSTRAINT SOLVER
#
from ortools.constraint_solver import pywrapcp

#
# For accessing system variables
#
import sys

#
# For parsing JSON data
#
import json


def print_sol(X, wines, nt, nw):
    print 'Wines  : %s' % ', '.join('%3s' % w['color'] for i, w in enumerate(wines))
    for j in range(nt):
        row = []
        for i in range(nw):
            row.append('%3d' % X[i][j].Value())
        print 'Tank %2s: %s' % (j, ', '.join(row))


def get_solution_values(X, nt, nw):
    values = []
    for j in range(nt):
        values.append([])
        for i in range(nw):
            values[j].append(X[i][j].Value())
    return values


def solve(data, time_limit = 2000, search_strategy = 'restart', log = False):
    #
    # CREATE A SOLVER INSTANCE
    # Signature: Solver(<solver name>)
    #
    slv = pywrapcp.Solver('tanks')

    # Cache some data for ease of access
    tanks = data['tanks']
    wines = data['wines']
    penalty = data['penalty']
    nt = len(tanks)
    nw = len(wines)

    wines = sorted(wines, key=lambda w: penalty[w['color']], reverse=True)

    # compute a safe eoh
    eoh = sum([ w['amount'] for i, w in enumerate(wines) ]) * penalty['B']

    # lower bound on z
    tot_cap = sum([ t['cap'] for t in tanks ])
    tot_amount = sum([ w['amount'] for w in wines ])
    residual = tot_amount - tot_cap
    z_lb = 0
    i = nw - 1
    while residual > 0 and i >= 0:
        w = wines[i]
        if residual - w['amount'] > 0:
            z_lb += w['amount'] * penalty[w['color']]
        else:
            z_lb += residual * penalty[w['color']]
        residual -= w['amount']
        i -= 1

    if log: print 'Z lower bound: %d' % z_lb

    #
    # CREATE VARIABLES
    # Signature: IntVar(<min>, <max>, <name>)
    #

    X = [ [ slv.IntVar(0, w['amount'], 'x[%d][%d]' % (i, j)) for j in range(nt) ] for i, w in enumerate(wines) ]
    Y = [ slv.IntVar(-1, 2, 'y[%d]' % i) for i in range(nt) ]

    # Objective variable
    z = slv.IntVar(z_lb, eoh, 'z')

    #
    # BUILD CONSTRAINTS AND ADD THEM TO THE MODEL
    # Signature: Add(<constraint>)
    #

    # capacity
    for j, t in enumerate(tanks):
        S = slv.Sum([ X[i][j] for i in range(nw) ])
        slv.Add(S <= t['cap'])

    for i, w in enumerate(wines):
        S = slv.Sum([ X[i][j] for j in range(nt) ])
        slv.Add(S <= w['amount'])

    # tank color
    for i, w in enumerate(wines):
        for j in range(nt):
            slv.Add((X[i][j] > 0) <= (Y[j] == w['class']))

    for j in range(nt):
        S = slv.Sum([ X[i][j] for i in range(nw) ])
        slv.Add((S == 0) <= (Y[j] == -1))

    # penalties
    penalties = []
    for i, w in enumerate(wines):
        assigned_wine = []
        for j in range(nt):
            assigned_wine.append(X[i][j])
        penalties.append((w['amount'] - slv.Sum(assigned_wine)) * penalty[w['color']])
    slv.Add(z == slv.Sum(penalties))

    #
    # THOSE ARE THE VARIABLES THAT WE WANT TO USE FOR BRANCHING
    #
    all_vars = [ X[i][j] for j in range(nt) for i in range(nw) ]

    #
    # DEFINE THE SEARCH STRATEGY
    #
    decision_builder = None
    if search_strategy == 'restart':
        decision_builder = slv.Phase(all_vars,
                                    slv.CHOOSE_RANDOM,
                                    slv.ASSIGN_MAX_VALUE)
    elif search_strategy == 'firstunbound':
        decision_builder = slv.Phase(all_vars,
                                    slv.CHOOSE_FIRST_UNBOUND,
                                    slv.ASSIGN_MAX_VALUE)

    #
    # INIT THE SEARCH PROCESS
    #
    search_monitors = [slv.SearchLog(500000)] if log else []
    search_monitors += [slv.TimeLimit(time_limit), slv.Minimize(z, 1)]
    if search_strategy == 'restart':
        search_monitors += [slv.LubyRestart(2)]
    slv.NewSearch(decision_builder, search_monitors)

    #
    # Search for a solution
    #
    nsol = 0
    zbest = None
    best_solution = None
    while slv.NextSolution():
        pass

        if log:
            print 'SOLUTION FOUND =========================='
            print_sol(X, wines, nt, nw)
            print 'Total penalty: %d' % z.Value()
            print 'END OF SOLUTION =========================='

        best_solution = get_solution_values(X, nt, nw)

        nsol += 1
        zbest = z.Value()

    #
    # END THE SEARCH PROCESS
    #
    slv.EndSearch()

    if log:
        if nsol == 0:
            print 'no solution found'
        else:
            print '%d solutions found. The best one has penalty %d.' % (nsol, zbest)

        # Print solution information
        print 'Number of branches: %d' % slv.Branches()
        print 'Computation time: %f (ms)' % slv.WallTime()
        if slv.WallTime() > time_limit:
            print 'Time limit exceeded'

    return best_solution

if __name__ == "__main__":
    # Parse command line
    if len(sys.argv) < 3:
        print 'Usage: python %s <restart|firstunbound> <data file> [timelimit]' % sys.argv[0]
        sys.exit(1)
    else:
        search_strategy = sys.argv[1]
        fname = sys.argv[2]
        timelimit = int(sys.argv[3]) if len(sys.argv) > 3 else 2000

    # Check input
    if search_strategy not in ['restart', 'firstunbound']:
        print 'Search strategy has to be "restart" or "firstunbound"'
        sys.exit(1)

    # READ PROBLEM DATA
    with open(fname) as fin:
        data = json.load(fin)

    solve(data, time_limit = timelimit, search_strategy = search_strategy, log = True)